chrome.commands.onCommand.addListener((command) => {
  if (command === "capture_iframe") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['content.js']
        },
        () => {
          chrome.tabs.sendMessage(tab.id, { action: "capture_iframe" });
        }
      );
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture_iframe_screenshot") {
    const iframePosition = message.iframePosition;
    
    // 현재 활성 탭에서 전체 화면 캡처
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(screenshotUrl) {
      // 캡처된 이미지를 content.js로 전송
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: handleScreenshotData,
          args: [screenshotUrl, iframePosition]
        });
      });
    });
  }
});

// content.js에서 사용할 함수 정의
function handleScreenshotData(screenshotUrl, iframePosition) {
  window.postMessage({
    action: 'process_screenshot',
    screenshotUrl: screenshotUrl,
    iframePosition: iframePosition
  }, '*');
}
