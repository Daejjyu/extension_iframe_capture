## Iframe Capture Extension
동영상 강의를 캡쳐하기 위해 만듬

CORS 문제가 있어 DOM 접근이 아닌 chrome의 captureVisibleTab API를 통해서 제작함
captureVisibleTab는 viewport 전체 화면 자체를 물리적(?)으로 캡쳐하는 듯 보임
캡쳐 후 iframe의 Pos, Size를 계산하여 이미지를 잘라서 클립보드에 복사

## 단축키
Ctrl + Shift + S

## How to use - GPT
크롬 익스텐션을 로컬에서 테스트하는 방법을 단계별로 안내해 드리겠습니다.

1. 크롬 확장 프로그램 개발자 모드 활성화
크롬 브라우저를 열고 주소창에 chrome://extensions/를 입력하고 Enter 키를 누릅니다.
오른쪽 상단에 있는 "개발자 모드" 버튼을 활성화합니다.

2. 확장 프로그램 로드하기
"압축 해제된 확장 프로그램 로드" 버튼을 클릭합니다.
개발 중인 크롬 익스텐션이 있는 폴더로 이동합니다. 이 폴더 안에는 manifest.json 파일이 포함되어 있어야 합니다.
폴더를 선택한 후 "선택" 버튼을 클릭합니다. 이렇게 하면 해당 익스텐션이 크롬에 로드됩니다.

4. 로컬 테스트 및 디버깅
크롬에서 익스텐션 아이콘이 상단 우측에 나타나면, 이를 클릭하여 익스텐션을 실행할 수 있습니다.
콘솔 출력 확인:
개발자 도구(DevTools)를 열어 (F12 또는 Ctrl+Shift+I), "콘솔" 탭에서 오류나 로그를 확인할 수 있습니다.
여기서 로그 출력이나 오류 메시지를 확인하면서 개발을 진행할 수 있습니다.

5. 익스텐션 업데이트
로컬에서 코드를 수정한 후, 크롬 익스텐션 페이지(chrome://extensions/)로 돌아가서 "새로 고침" 아이콘을 클릭합니다. 그러면 수정된 내용을 바로 테스트할 수 있습니다.

6. 다른 브라우저에서 테스트 (선택사항)
크롬 외에도 Microsoft Edge와 같은 다른 Chromium 기반 브라우저에서 로컬 익스텐션을 테스트할 수 있습니다. 이 경우, Edge의 주소창에 edge://extensions/를 입력하고, 위와 같은 방법으로 익스텐션을 로드합니다.

주의사항
manifest.json 파일에 정의된 모든 권한(permissions)이나 설정이 로컬 환경에서도 정확히 반영되는지 확인해야 합니다.
일부 기능은 크롬 웹 스토어에서만 작동할 수 있으므로, 로컬 테스트 후 스토어에 배포해 실제 환경에서 테스트하는 것도 중요합니다.
이 방법으로 크롬 익스텐션을 로컬에서 테스트하고 디버깅할 수 있습니다.

## 구현 후 느낀 점
GPT 최고. Bot, Tool 제작이 굉장히 쉬워짐
  * 보통 처음 접하는 분야는 문서 읽고 적용에 시간이 오래 걸리는데, 실제 구현 및 디버깅하며 빠르게 개념 이해 및 구현 가능

## About Chrome Extension
크롬 익스텐션 동작 정리

1. chrome API
   * 크롬 동작을 위한 API가 따로있음
   * 워커와 페이지 간 여러 이벤트 송신이 가능 sendMessage('eventName', data)
2. manifest.json - 메타정보, 코드 진입점, 불러올 코드 정의
3. popup.html
   * 초기 로딩, script 태그를 통해 로컬 소스나 (lib/library) cdn 리소스 불러오기 가능
   * 확장 프로그램 버튼을 눌렀을 때의 UI를 구현 가능능
   * css 주입 가능
4. background.js 
   * 웹 워커에서 실행 되며 DOM 접근 등 WEB API 사용이 불가능 함
   * 일반적인 방식으로 로그가 찍히지 않고, 확장 프로그램 로그를 확인해야 한다.
   * 각 페이지가 아니라 크롬 프로그램 자체에 종속되는 것 같음. 여러 탭을 오가며 이벤트를 날릴 수 있다. 
   * postMessage, sendMessage등을 통해 content.js에 정보를 넘길 수 있다.
     * chrome.tabs.sendMessage(tabId, ...)
     * window.postMessage
   * ![image](https://github.com/user-attachments/assets/08218f6f-495b-48e7-bdd0-adc84e00576b)
5. content.js
   * 페이지에서 실행되는 js
   * 일반적으로 콘솔에서 실행시키는 환경이랑 유사하다고 이해하면 될 듯
   * background.js와 통신하여 chrome API에서 가져온 정보들을 활용할 수 있다.
     * chrome.runtime.sendMessage
     * iframe postMessage

