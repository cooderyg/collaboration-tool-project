window.addEventListener('DOMContentLoaded', async () => {
  await columnView();
});

// path의 보드ID를 가져오기
const boardId = window.location.pathname.split('/')[2];

// 새 컬럼추가 버튼
const addBtn = document.getElementById('add-btn');
// 새컬럼 추가
const addColumn = async () => {
  const columnName = document.getElementById('column-name').value;
  if (columnName === '') {
    alert('컬럼이름을 입력해 주세요');
  } else {
    await fetch(`/api/${boardId}/column`, {
      method: 'POST',
      body: JSON.stringify({
        name: columnName,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        alert(result.message);
      });
    location.reload();
  }
};
// 컬럼 추가하기 버튼
addBtn.addEventListener('click', addColumn);

// 컬럼데이터 가져오기
const getColumns = async () => {
  const datas = await fetch(`/api/${boardId}/column/`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data.datas);
      return data.datas;
    })
    .catch((err) => {
      console.log(err);
    });

  return datas;
};

// 컬럼데이터 뿌려주기
const columnView = async () => {
  // 컬럼의 데이터들
  const columns = await getColumns();
  // HTML상의 컬럼리스트document에 접근
  const columnList = document.getElementById('column-list');

  columns.forEach(async (el) => {
    const column = document.createElement('div');
    column.innerHTML = `<div id="${el.columnId}" class="column">
                          <div>
                            <div class="column-title">
                              <h2>${el.name}</h2>
                              <span>${el.order}</span>번
                            </div>
                            <input id="new-name" type="text">
                            <button id="edit-name-btn" onclick="editName()" class="edit-name">이름수정</button>
                            <input id="new-order" type="text">
                            <button id="edit-order-btn" onclick="editOrder()" class="edit-order">순서수정</button>
                            <button onclick="removeColumn()">삭제하기</button>
                            <button onclick="openModal()">카드추가</button>
                          </div>
                        </div>`;
    columnList.append(column);
  });
  // 컬럼에 포함된 카드들을 뿌려주기
  cardView();
  // 컬럼 이름변경
};

// 카드데이터 가져오기
const getCards = async (columnId) => {
  const datas = await fetch(`/api/${columnId}/card`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
    });

  return datas
};

// 카드데이터 뿌려주기
const cardView = async () => {
  // 컬럼의 태그정보들을 거져온다
  const columns = document.querySelectorAll('.column');
  columns.forEach(async (el) => {
    // 컬럼의 태드정보에 있는 컬럼id값을 보낸다.
    const cards = await getCards(el.id);
    console.log('cards = ', cards)
    // 해당 컬럼에 카드들이 있으면
    if (cards.datas) {
      cards.datas.forEach((el2) => {
        const card = document.createElement('div');
        card.innerHTML = `<div id="${el2.cardId}" onclick="location.href='/cards/${el2.cardId}'" class="card" style="background-color:${el2.color}">
                            <h3>${el2.name}</h3>
                            <div>${el2.content}</div>
                          </div>`;
        el.append(card);
      });
    }
    // 해당 컬럼에 카드들이 없으면
    if (cards.message) {
      const card = document.createElement('div');
      card.innerHTML = `<div>${cards.message}</div>`;
      el.append(card);
    }
  });
};

// 컬럼 이름 변경
async function editName($event) {
  const parentElement = event.target.parentElement;
  const newName = parentElement.childNodes[3].value;
  const columnId = event.target.parentElement.parentElement.id;

  await fetch(`/api/${boardId}/column/${columnId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: newName,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
    });
  location.reload();
}

// 컬럼 순번 변경
async function editOrder($event) {
  const parentElement = event.target.parentElement;
  const newOrder = parentElement.childNodes[7].value;
  const columnId = event.target.parentElement.parentElement.id;

  await fetch(`/api/${boardId}/column_order/${columnId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order: newOrder,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log('result = ', result);
      alert(result.message);
    });
  location.reload();
}

// 컬럼 삭제하기
async function removeColumn($event) {
  const columnId = event.target.parentElement.parentElement.id;
  await fetch(`/api/${boardId}/column/${columnId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
    });
  location.reload();
}

const closeBtn = document.getElementById('close-modal');
const modal = document.getElementById('modal');

// 날짜 셀렉트박스의 기본값으로 현재 날짜 넣기
document.getElementById('card-end-date').value = new Date().toISOString().substring(0, 10);

// 모달창 열기
closeBtn.addEventListener('click', closeModal);

let columnId;
// 모달창 열기
async function openModal() {
  columnId = event.target.parentElement.parentElement.id;
  console.log(' columnId = ', columnId);
  modal.style.display = 'block';
}
const formCard = document.getElementById('form-card');

// card생성 api에 form데이터 전송
// 새로운 카드 생성
formCard.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = new FormData(formCard);
  console.log([...payload], columnId);

  await fetch(`/api/card`, {
    method: 'POST',
    body: JSON.stringify({
      columnId: columnId,
      name: [...payload][0][1],
      content: [...payload][1][1],
      color: [...payload][2][1],
      endDate: [...payload][3][1],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
    });
  location.reload();
});

// 모달창 닫기
async function closeModal() {
  modal.style.display = 'none';
}
