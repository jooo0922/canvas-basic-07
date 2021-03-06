'use strict';

// 이제 좀 더 복잡하게 만들어보자.
// 이런 클릭할 캔버스 그림들이 여러 개 있고, 겹쳐있고 이런 경우 어떻게 처리할 것인지
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
const boxes = [];

// 마우스 클릭 좌표를 담아놓을 객체
// 클릭할 때마다 이벤트 객체의 layerX, Y를 이 객체의 x, y로 세팅을 하고 이 객체를 이용해서 뭔가 하겠다는 것.
const mousePos = {x: 0, y: 0}; 

// 클릭된 box를 넣어놓을 변수. 나중에 그려진 박스, index가 높은 순서대로 값이 override될거임.
// 값이 계속 override되기 때문에 const가 아닌 let으로 선언한 것.
let selectedBox; 

// 박스마다 매긴 index를 텍스트로 그릴 때 적용할 폰트를 global scope에서 미리 정의한 것
context.font = 'bold 30px sans-serif';

// 이번에는 01.html에서 그렸던 박스를 랜덤으로 여러 개 배치할거임.
// 해당되는 박스가 정확히 클릭됬는지 판별하는걸 만들거임.
// 일단 같은 성질의 박스를 여러 개 만들거니까, class로 만들어서 instance들을 생성하는 게 편하겠지?
// 그래서 new Box(); 할 때마다 박스가 생성되서 10개를 (x, y) 좌표가 랜덤하게 생성할거임.
class Box {
  constructor(index, x, y, speed){
    // 클릭했을 때 내가 클릭한 박스의 번호를 찍어보자. 그래야 어떤 애가 제대로 클릭됬는지 제대로 인식이 될테니까.
    // 각 박스마다 고유 식별자, 번호를 매겨보자. 
    this.index = index;

    // this로 하면 아래처럼 새로운 instance에서 b.x, b.y 이렇게 접근이 가능하겠지? 
    // 즉, 이 클래스를 통해서 만들어낸 인스턴스 객체의 속성이 되는 것!
    this.x = x; 
    this.y = y;

    // 이렇게 박스가 움직이는 스피드를 따로 속성으로 설정해두고, 새로운 인스턴스를 만들때마다
    // random한 값을 받아서 speed parameter 자리에 전달하면 박스마다 랜덤한 스피드가 나오겠지? 
    this.speed = speed;

    // 여기서는 박스의 크기를 각기 다르게 전달받으려는 건 아니니까 그냥 값만 할당해서 잡아놓자.
    // 이렇게 생성자 내부에서 고정된 값을 할당받아서 속성을 만들어 사용할 수도 있음.
    this.width = 100;
    this.height = 100;

    // 이렇게 생성자에서 메소드를 호출하면 박스를 만드는 동시에 draw를 호출해서 그리기도 가능함.
    // 이렇게 메소드를 클래스안에서 정의하고 생성자 안에서 호출되게 만들면
    // 인스턴스가 생성됨과 동시에 자동으로 메소드가 호출될 수 있음. 아주 유용한 트릭이므로 잘 기억해둘것.
    this.draw();
  }

  // 얘가 실질적으로 사각형을 그려내는 메소드니까 requestAnimationFrame()으로 얘를 반복 호출해줘야 애니메이션이 되겠지
  // 근데 움직이게 해야하니까 그냥 호출하는게 아니고 x, y 좌표값을 바꿔주면서 호출할 수 있도록 해야겠지?
  // 가장 심플하게 왼쪽에서 오른쪽으로 흘러가는 애니메이션으로 해보자. 그럼 x좌표값을 ++해주면 되겠지?
  draw(){
    context.fillStyle = 'rgba(0, 0, 0, 0.5)' // 시꺼먼 색은 겹치는 부분이 어떻게 겹치는지 안보이니까 투명도를 준 것.
    context.fillRect(this.x, this.y, this.width, this.height);
    // 좌표값은 자기 스스로의 값으로 전달하고, 사이즈만 100, 100으로 지정해줘서 캔버스에 그리는 메소드

    // 각 박스마다 매긴 index를 박스마다 눈에 보이게 텍스트로 그려주도록 하자 
    context.fillStyle = '#fff';
    // fillText()는 매개변수를 최소 3개 전달해줘야 함.
    // fillText(text, x, y [, maxWidth]) 주어진 (x, y) 위치에 주어진 텍스트를 채움. 최대 폭(width)은 옵션 값.
    context.fillText(this.index, this.x + 30, this.y + 30);
  }
}

// draw를 반복해서 호출해주는 함수를 만든거임
function render(){ 
  context.clearRect(0, 0, canvas.width, canvas.height); // 새로운 프레임을 그릴때마다 이전 프레임은 항상 지워줘야 애니메이션이 되겠지?

  // 우리가 draw()를 box 10개 각각 다 반복해줘야 하니까 10번씩 해줘야겠지?
  // 여기서도 마찬가지로 앞서 만든 boxes라는 배열에 10개 잘 넣어놨으니까 얘를 for loop를 돌려서 각각 draw해주면 되겠지
  let box;
  for (let i = 0; i < boxes.length; i++) {
    box = boxes[i];
    // 일단 draw를 해주기 전에, 이 box의 x좌표값을 바꿔주면 되겠지? 3px씩 움직여보자
    // render함수가 호출될 때마다 box 인스턴스 안에 존재하는 x값을 3씩 더해서 할당해 줌. 
    // box.x += 3; 
    // 그런데 이 때, 모든 사각형에 대하여 3px씩 더해서 움직여주면, 사각형 10개가 뭉텅이로 같은 속도로 움직임. 재미없어보임.
    // 그러면 사각형마다 움직이는 속도, 즉, box.x += ; 의 값들을 바꿔줘야겠지. 
    // 얘도 class Box에서 각 박스의 속성으로 세팅해서 그 값을 이용해보자 
    box.x += box.speed

    if (box.x > canvas.width) {
      // 이 if 블록은 각각의 사각형의 x좌표값이 canvas.width를 벗어났을때 캔버스 왼쪽에서 다시 나타나게 하려고 만든 거
      // 단, box.x = 0; 이렇게 x좌표값을 초기화하면, 캔버스 왼쪽에서 사각형들이 처음 그려져서 나오기 때문에 어색해보임
      // box.x = 0; 이렇게 초기화해버리면 캔버스 밖에서 안으로 조금씩 들어오는 모습을 그려내지 못하기 때문에 그런거!

      // 더 자연스럽게 보이려면, box.width만큼 캔버스 왼쪽 바깥으로 나가있는 상태에서 처음 사각형이 그려지고,
      // 나가있는 사각형이 render 호출될 때마다 3px씩 캔버스 안으로 들어오면서 draw되어야 자연스럽게 보일거임.
      box.x = -box.width; 
    }
    box.draw(); // 그 상태에서 box 인스턴스 안에 존재하는 draw메소드를 호출해준다.
    // render 함수가 호출될 때마다 10개의 사각형에 각각 이 짓을 해준다.
    // 그럼 render가 계속 호출될 때마다 10개의 사각형이 box.x += 3 한 상태로 10개의 사각형을 매번 새롭게 draw하니까
    // 10개의 박스들이 오른쪽으로 흘러가는 애니메이션이 나오겠지
  }
  requestAnimationFrame(render);
}

render();

// const b = new Box(20, 100); 
// 이렇게 파라미터로 전달하는 값이 class내에 생성자(constructor)의 매개변수로 들어감.
// 근데 이 x, y에 해당하는 값들이 랜덤하게 뿌려져야 하니까 필요한 박스 개수만큼 for loop를 돌려보자
let tempX, tempY, tempSpeed;
for (let i = 0; i < 10; i++) {
  // random 메소드는 0~1 사이에 난수를 리턴해줌.
  // 우리는 캔버스의 width값 까지인 0 ~ canvas.width 사이의 랜덤한 x좌표값이 필요한거니까 canvas.width을 곱해줘야 함. y좌표값도 마찬가지
  // 0.8 곱해주는 이유는 완전 끝자락에 x좌표값이 생성되면 (예를 들어 599) 캔버스 영역을 벗어나서 박스가 그려짐. 
  // 캔버스 영역 안쪽에만 그리고 싶은거야! 대략 width * 0.8 까지만 랜덤하게 x좌표값을 받겠다는 거. y좌표값도 마찬가지! 
  tempX = Math.random() * canvas.width * 0.8; 
  tempY = Math.random() * canvas.height * 0.8;  

  tempSpeed = Math.random() * 4 + 1 
  // 속도값을 5까지만 랜덤하게 받으려고 하는데, 1은 왜 더해줄까?
  // random() 메소드는 0부터 1까지 무작위로 리턴하는데, 0을 리턴받으면 5 곱해줘도 0이 나오고, 속도가 0이면 안움직이잖아?
  // 그런 경우 최소한의 속도를 1로 잡아주기 위해 1을 더해준거고, 속도값을 5까지만 받기로 했으니 
  // 0 ~ 1사이의 난수 * 4 를 해줘야 + 1 했을 때 5를 넘지 않는 값을 할당받을 수 있겠지.
  // random으로 리턴받는 값의 범위를 정하는 건 이런식으로 하면 된다!

  // 이제 랜덤하게 생성된 박스 인스턴스들을 따로 관리해줄 필요가 있다. 일단 배열에 넣어놓자.
  boxes.push(new Box(i, tempX, tempY, tempSpeed)); // 여기에 파라미터 자리에 랜덤하게 뿌려줘야 함.

  // 이제 이렇게 하면 box가 10개가 생성이 되고, boxes 배열 안에 들어가겠지.
  // new Box() 얘가 제대로 호출되어야 생성자 안에 draw 메소드가 잘 그려지겠지.
  // 근데 index를 생성자의 파라미터로 추가했는데도, 인스턴스를 호출할 때 i값을 파라미터로 넣어주지 않으면
  // tempX값을 index로 넣고, tempY를 this.x에 할당해버리게 되니 draw메소드가 제대로 실행이 안되겠지?
  // 항상 클래스 내에 생성자에 파라미터를 추가하면 새로운 인스턴스로 호출한 부분에도 그 자리에 맞는 파라미터값을 전달해줄 것!
}

// 콘솔창에는 10개의 좌표값이 포함된 인스턴스들이 나올거고, 얘내들을 이용해서 01.html처럼 박스를 그려주면 되겠지?
// 그런데 그림을 그리는 것도 사실 class Box의 기능인거지. 이거를 그리는 기능도 class가 갖고있으면 좋겠지.
// class 바깥에서 boxes 배열을 이용해서 그릴수도 있겠지만 굳이 그러지말고 
// 생성된 인스턴스가 알아서 스스로의 박스를 그리도록 클래스 안에 메소드를 추가해주자.
console.log(boxes);

// 이제 박스마다 번호까지 매겼으니 내가 클릭한 박스의 번호와 콘솔에 찍힌 번호가 같으면 클릭 구현이 제대로 된거겠지?
// 01.html에서 한거랑 똑같이 캔버스에 이벤트리스너를 걸어서 하면 됨.
// 화살표 함수는 파라미터가 1개일 때 파라미터를 괄호처리 해주지 않아도 됨.
canvas.addEventListener('click', e => {
  // 바로 e.layerX,Y 로 하지 말고 마우스 찍은 좌표를 따로 담아놓을 객체를 만들어보자.
  // 지금은 굳이 이렇게까지 할 필요는 없지만 이렇게 해두는 습관을 들이면 나중에 기능이 복잡하고 많아졌을때 편할 일이 많다.
  mousePos.x = e.layerX;
  mousePos.y = e.layerY;

  // 이제 클릭한 좌표랑 사각형의 위치 범위를 비교하면 되는데, 사각형이 10개니까 for loop으로 10개를 다 해줘야 함.
  let box; // let은 변수이기 때문에 const와 달리 할당하지 않고 선언만 해도 오류가 없음.
  for (let i = 0; i < boxes.length; i++) {
    box = boxes[i]
    // 여기서 조건문 선언할 때, 100이 box의 width잖아?
    // 근데 나중에는 박스 크기가 제각각이 되면 그냥 100 이렇게 쓸 수 없으니까,
    // 애초에 처음부터 클래스에서 박스의 크기도 속성으로 잡아놓자. 
    // 코드의 길이는 더 길어지겠지만 개념상으로는 더 명확해보이겠지?
    if (mousePos.x > box.x &&
        mousePos.x < box.x + box.width &&
        mousePos.y > box.y &&
        mousePos.y < box.y + box.height) {
          // 이제 이 조건문에만 부합하는 좌표이면 클릭이 인식된 것이므로
          // 콘솔에 클릭됬다고 찍어주던 원하는 기능을 써주면 됨.
          // console.log(box.index);

          // 근데 캔버스는 그림에 불과하기 때문에, 겹치는 부분을 클릭하면 그냥 겹치는 사각형들의 index가 전부 찍힘.
          // 우리가 여기서 하나만 클릭이 되게 해야한다면, 그 우선순위, 기준이 무엇이 되어야 할까?
          // 뭘 기준으로 하나를 클릭할 수 있게 해야 자연스러울까? '제일 나중에 그려진 사각형'
          // 그게 레이어 개념으로 생각해본다면 가장 위에 위치한 레이어라고도 볼 수 있잖아?
          // 그니까 index값이 가장 높은 게 가장 나중에 boxes에 push된 거니까, index값이 가장 높은 사각형을 콘솔에 찍어야겠지?

          // 이걸 어떻게 할거냐면, 어떤 변수를 하나 만들어놓고, 클릭이 됬을 때 클릭된 박스가 있다면, 걔를 무조건 변수안에 넣어놓을거임.
          // 클릭이벤트가 발생할 때마다 10개의 사각형들이 모두 for loop를 돌다가, 조건문에 해당 안되는 건 패스되고,
          // 조건문에 해당되는 애를 그 변수안에 집어넣는거임.
          // 근데 만약 여러 개가 겹쳐진 부분이 클릭됬다면, 즉 저 if 조건문을 통과하는 box가 여러 개라면,
          // 해당 변수에 조건문을 통과한 box를 계속 override할거임. 가장 마지막에 할당된 애만 남겠지.
          // 그러면 가장 마지막에 for loop를 통과하는, index값이 가장 높은 애가 마지막으로 할당되겠지.
          // 이렇게 하면 '제일 나중에 그려진 사각형'이 클릭된 것으로 인식할 거임.
          selectedBox = box;
        }
  }
  // for loop가 끝난 지점에서 최종적으로 할당받은 selectedBox를 출력해보자
  // 여기서 끝내기 심심하니까 크기가 각각 다른 박스가 움직이면서 클릭이벤트를 받을 수 있도록 해보자
  // 근데 만약에, canvas click 했을 때 10개의 사각형 범위 중 하나라도 해당되지 않는 좌표, 즉 빈 곳이 클릭된다면?
  // 위에 if block이 실행되지 않아서 selectedBox = undefined로 남아버림.
  // 그러면 selectedBox.index를 출력하면 당연히 오류가 나겠지?
  // 따라서 if문으로 또 감싸야함. selectedBox값이 존재하는 경우에만!! selectedBox.index를 콘솔에 찍으면 오류가 안나겠지!
  if (selectedBox) {
    console.log(selectedBox.index);

    // box를 클릭하고 나서 빈 공간을 클릭하면 해당 box.index가 계속 출력되는 버그를 해결해야 함.
    // 이게 왜 그런거냐면 빈 공간을 클릭하면 selectedBox가 override가 안되니까 이전에 클릭해서 남아있는 box의 index가 계속 출력되는거
    // 그니까 selectedBox의 값이 존재하고, 그래서 if block을 수행해서 index를 출력하고 나면은 항상 undefined, null 등으로 초기화를 해줘야
    // 나중에 빈 공간을 클릭했을 때 남아있는 값이 콘솔에 출력되지 않을 수 있음.
    selectedBox = undefined;
  }
});

// 오늘 해본 게 뭐냐면 캔버스에서 특정 객체(?) 이미지 라고 해야되나 암튼 특정 이미지를 찍어보는 것 
// 그래서 클릭이 되었을 때 그 클릭된 정보를 이용해서 뭔가를 해볼 수 있겠지
// 그래서 다음 시간에는 이걸 이어서 완성해볼 것. 오늘은 단순이 index값 출력하는 정도로 해봤지만
// 다음 시간에는 좀 더 기능을 붙여서 뭔가 상세페이지도 열린다던지, 특정 박스를 클릭해서 상세페이지가 열리면
// 뒤에 있는 박스들의 속도가 느려진다던지, 멈춘다던지, 흐려진다던지 여러 기능을 붙여 볼 수 있겠지
// 사실 이런거는 캔버스 외에도 구현할 방법이 많지만 우리는 캔버스를 공부하고 있으니까 캔버스로만 해보자.