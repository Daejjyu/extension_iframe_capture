// 팝업이 열릴 때 저장된 값을 가져와 드롭다운 메뉴에 설정
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['videoAspectRatio'], function(result) {
    if (result.videoAspectRatio) {
      document.getElementById('aspectRatio').value = result.videoAspectRatio;
    }
  });
});

// 드롭다운 메뉴 변경 시 저장
document.getElementById('aspectRatio').addEventListener('change', function() {
  const selectedRatio = parseFloat(this.value);
  chrome.storage.sync.set({ videoAspectRatio: selectedRatio }, function() {
    console.log('Video aspect ratio is set to ' + selectedRatio);
  });
});