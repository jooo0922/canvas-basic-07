'use strict';

// Interaction
// DOM vs Canvas
// DOM은 querySelector 같은거로 가져올 수 있지만, Canvas는 불가능하다. 왜? '그림'이니까.
// 하지만, 캔버스를 하나의 인터페이스, ui처럼 사용하려면 이벤트를 걸고 인식할 수 있도록 해야한다.
// 캔버스에서 이벤트를 걸려면 어떻게 해야 할까?
// 일단 어떤 박스를 들고 클릭하는 걸 해보자
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');

context.fillRect(200, 200, 100, 100);
// 이게 캔버스가 아니라 그냥 DOMElement 였다면 얘의 class나 id로 가져온 다음 addEventListener로 클릭 이벤트를 바인딩 해줬겠지

// 근데 캔버스는 우리가 사각형을 그리기는 했지만, 이 아이는 따로 객체로 존재하는 애가 아님.
// 이 사각형은 말그대로 '그림' 일 뿐임. 그래서 DOM마냥 이 사각형을 따로 잡아낼 수가 없겠지.

// 이 사각형을 클릭을 인식하려면 어떻게 해야할까?
// '좌표'를 얻어와야겠지. 
// '내가 지금 클릭한 위치의 좌표' 와 '사각형의 영역'을 비교해서 그 영역이 겹치면 이 사각형을 클릭했다고 판단하게 하는거지!
// 이거를 코드로 만들어보면 되겠지.

// 일단 어쨋거나 캔버스가 클릭을 받을거니까 캔버스에 클릭 이벤트를 바인딩 해보자!
// 클릭한 좌표를 알아내야 함. 그 값을 누가 가지고 있을까?
// 바로 함수가 이벤트 리스너로 실행됬을 때 '자동으로 parameter자리에 생기는 event 객체'
function clickHandler(e){
  // console.log(e.clientX, e.clientY);
  // clientX,Y 는 브라우저를 기준으로 좌표값을 리턴해 줌. 우리한테 필요한 건 캔버스를 기준으로 좌표값을 얻어야 함.
  // laverX, Y 는 레이어 개념으로 봐서 위에 떠있는, 겹쳐있는 애가 있으면, 그 위에 있는 애를 기준으로 좌표를 잡음.
  // 여기서는 canvas element가 위에 있는 박스 요소니까 이걸 위에 있는 레이어로 보고 얘를 기준으로 잡은거.
  // console.log(e.layerX, e.layerY);
  const x = e.layerX;
  const y = e.layerY;

  // 이제 마우스 좌표를 사각형 영역이랑 비교하면 되겠지?
  // 캔버스의 x좌표를 기준으로 보면 사각형의 x좌표값 200을 넘으면서, 사각형의 width 안쪽에 있는 곳 까지만 사각형의 영역이니까
  // x좌표값 < x < x좌표값 + 사각형 width 범위 안에 있을 때만 클릭했다고 판단해야겠지. y좌표도 같은 원리
  if (x > 200 && 
      x < 200 + 100 &&
      y > 200 &&
      y < 200 + 100) {
    console.log('ok');
  }
}

canvas.addEventListener('click', clickHandler);