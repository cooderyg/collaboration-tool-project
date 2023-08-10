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

const commentEl = document.querySelector('.comment');

const getCommentData = async () => {
  // 서버에서 댓글 목록을 가져와서 화면에 표시하는 함수
  const response = await fetch('/api/comments'); // 댓글을 가져오는 API 엔드포인트
  const { data } = await response.json();

  // data 배열을 순회하며 댓글 정보를 화면에 표시하는 HTML 생성
  const temp = data.map((comment) => {
    return `
          <div class="comment" data-id=${comment.commentId}>
            <p class="comment-author">${comment.author}</p>
            <p class="comment-content">${comment.content}</p>
            <button class="edit-comment-btn">수정</button>
            <button class="delete-comment-btn">삭제</button>
          </div>
        `;
  });

  const joinTemp = temp.join('');
  commentEl.innerHTML = joinTemp;
};

getCommentData(); // 초기 데이터 로드

commentEl.addEventListener('click', async function (e) {
  // 댓글 수정 또는 삭제 버튼 클릭 시의 동작 처리
  if (
    !e.target.classList.contains('edit-comment-btn') &&
    !e.target.classList.contains('delete-comment-btn')
  )
    return;

  const commentId = e.target.parentNode.getAttribute('data-id');

  if (e.target.classList.contains('edit-comment-btn')) {
    // 댓글 수정 버튼 클릭 시의 동작 처리
    // 수정할 수 있는 입력 폼을 표시하고 수정을 수행하는 로직 작성
  }

  if (e.target.classList.contains('delete-comment-btn')) {
    // 댓글 삭제 버튼 클릭 시의 동작 처리
    const confirmDelete = confirm('정말로 삭제하시겠습니까?');
    if (!confirmDelete) return;

    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(data);

    if (data.message === '삭제가 완료되었습니다.') {
      getData(); // 삭제 후 데이터를 다시 로드하여 화면 갱신
    } else {
      alert(data.message);
    }
  }
});
