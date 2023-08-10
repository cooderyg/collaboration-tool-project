const cardId = window.location.pathname.split('/')[2];
const cardEl = document.querySelector('.card');
const cardName = document.querySelector('.card-name');
const cardContent = document.querySelector('.card-content');
const endDate = document.querySelector('.end-date');
const cardUser = document.querySelector('.card-user');
const editBtnEl = document.querySelector('.edit-btn');
const deleteBtnEl = document.querySelector('.delete-btn');

const getData = async () => {
  const response = await fetch(`/api/cards/${cardId}`);
  const { data } = await response.json();
  console.log(data);
  const userName = data.User.name;
  const { color, name, content, endDate: endDateData } = data;
  if (color === 'WHITE') {
    cardEl.style.backgroundColor = '#F5F5DC';
  } else if (color === 'RED') {
    cardEl.style.backgroundColor = '#DC143C';
  } else {
    cardEl.style.backgroundColor = '#32CD32';
  }
  console.log(endDateData);
  cardName.innerText = name;
  cardContent.innerText = content;
  endDate.innerText = endDateData;
  cardUser.innerText = `작성자 : ${userName}`;
};
getData();

editBtnEl.addEventListener('click', () => {
  window.location.href = `/cards-edit/${cardId}`;
});
deleteBtnEl.addEventListener('click', async () => {
  if (!confirm('정말로 삭제하시겠습니까?')) return;

  const response = await fetch(`/api/card/${cardId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log(response);
  if (response.ok) {
    window.history.back();
  }
});

// #DC143C 빨강
// #32CD32 녹색
// #F5F5DC 흰색
