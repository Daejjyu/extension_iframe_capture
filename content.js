let isListenerAdded = false; // 리스너가 이미 등록되었는지 확인하는 플래그

// 기본 영상 비율
let videoAspectRatio = 1.8;

// 저장된 영상 비율 값 가져오기
chrome.storage.sync.get(['videoAspectRatio'], function(result) {
  if (result.videoAspectRatio) {
    videoAspectRatio = result.videoAspectRatio;
  }
});

// chrome.runtime.onMessage.addListener는 한 번만 등록되도록 수정
if (!isListenerAdded) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_iframe") {
      captureIframePositionAndSendToBackground();
    }
  });

  // 리스너 등록 상태로 변경
  isListenerAdded = true;

  // 일정 시간 후에 리스너를 다시 등록할 수 있도록 설정 (예: 3초 후)
  setTimeout(() => {
    isListenerAdded = false;
  }, 3000); // 3초 후에는 리스너가 다시 등록될 수 있음
}

function captureIframePositionAndSendToBackground() {
  // iframe 위치 찾기
  const iframes = document.querySelectorAll('iframe');
  
  if (iframes.length === 0) {
    console.log("iframe을 찾을 수 없습니다.");
    return;
  }

  const iframe = iframes[0]; // 첫 번째 iframe을 대상으로 잡기
  const rect = iframe.getBoundingClientRect();
  const iframeWidth = rect.width;
  const iframeHeight = rect.height;
  const iframeTop = rect.top + window.scrollY;
  const iframeLeft = rect.left + window.scrollX;

  // console.log(`iframe 위치: ${iframeTop}, ${iframeLeft}`);
  // console.log(`iframe 크기: ${iframeWidth}x${iframeHeight}`);

  // // viewport 크기 출력
  // console.log(`viewport 크기: ${window.innerWidth}x${window.innerHeight}`);
  
  // 위치 정보를 background script로 보내기
  chrome.runtime.sendMessage({
    action: "capture_iframe_screenshot",
    iframePosition: {
      x: iframeLeft,
      y: iframeTop,
      width: iframeWidth,
      height: iframeHeight
    }
  });
}

window.addEventListener("message", function(event) {
  // background.js에서 보낸 데이터 처리
  if (event.data.action === 'process_screenshot') {
    const screenshotUrl = event.data.screenshotUrl;
    const iframePosition = event.data.iframePosition;

    // 캡처된 이미지를 canvas에 그리기
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 캡처된 이미지 URL을 fetch로 불러와서 Blob으로 처리
    fetch(screenshotUrl)
      .then(response => response.blob())
      .then(blob => {
        const objectURL = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = function() {
          // 디버그: 캡처된 이미지 크기 출력
          // console.log("캡처된 이미지 크기, 비율: ", img.width, img.height,img.width/img.height);
          // console.log("뷰포트 크기, 비율: ", window.innerWidth, window.innerHeight,window.innerWidth/window.innerHeight);

          // 1. 비율 계산 (스크린샷 크기와 viewport 크기 비교)
          const scaleX = img.width / window.innerWidth;
          const scaleY = img.height / window.innerHeight;

          // console.log(`scaleX: ${scaleX}, scaleY: ${scaleY}`);
          
          // 2. iframe 크기와 위치를 비율에 맞게 재조정
          let adjustedWidth = iframePosition.width * scaleX;
          let adjustedHeight = iframePosition.height * scaleY;
          let adjustedLeft = iframePosition.x * scaleX;
          let adjustedTop = iframePosition.y * scaleY;

          // console.log(`본래 iframe 비율: ${iframePosition.width}x${iframePosition.height}, ${iframePosition.width/iframePosition.height}`);
          // console.log(`조정된 iframe 크기 및 비율: ${adjustedWidth}x${adjustedHeight}, ${adjustedWidth/adjustedHeight}`);
          // console.log(`조정된 iframe 위치: ${adjustedLeft}, ${adjustedTop}`);

          const aspectWidth = videoAspectRatio * adjustedHeight;
          // 너무 크면 양 옆 자르기
          // console.log(adjustedWidth, adjustedHeight, videoAspectRatio, aspectWidth)
          const arbitraryThreshold = 1.2;
          if (adjustedWidth / aspectWidth > arbitraryThreshold) { 
            const exceeded = adjustedWidth - aspectWidth;
            adjustedLeft += exceeded / 2;

            adjustedWidth = aspectWidth;
          }

          // 캔버스 크기 설정 (스크린샷 이미지 크기에 맞게 캔버스를 설정)
          canvas.width = adjustedWidth;
          canvas.height = adjustedHeight;

          // 캡처한 이미지에서 iframe 위치에 해당하는 부분만 캔버스에 그리기
          ctx.drawImage(
            img, 
            adjustedLeft, adjustedTop, adjustedWidth, adjustedHeight, // 이미지의 잘라낼 부분
            0, 0, adjustedWidth, adjustedHeight // 캔버스에 그릴 위치
          );

          // 잘라낸 이미지를 클립보드로 복사
          canvas.toBlob(function(blob) {
            const clipboardItem = new ClipboardItem({ "image/png": blob });

            // 클립보드에 이미지 복사
            navigator.clipboard.write([clipboardItem]).then(() => {
              console.log("이미지가 클립보드에 복사되었습니다.");
            }).catch(err => {
              console.error("클립보드 복사 실패:", err);
            });
          });
        };
        img.src = objectURL;
      })
      .catch(error => {
        console.error('이미지 로딩 중 오류 발생:', error);
      });
  }
});
