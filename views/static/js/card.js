document.addEventListener('DOMContentLoaded', function () {
  const addCardButton = document.querySelector('#add-card-button');
  addCardButton.addEventListener('click', function (event) {
    addCard(event);
  });

  const editButtons = document.querySelectorAll('.btn-edit-card');
  editButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      editCard(event);
    });
  });

  const deleteButtons = document.querySelectorAll('.btn-delete-card');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      deleteCard(event);
    });
  });

  const moveButtons = document.querySelectorAll('.btn-move-card');
  moveButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      moveCard(event);
    });
  });
});

function getCards() {}

function addCard(event) {
  const button = event.target;
  const columnId = button.getAttribute('columnId');
  const cardName = prompt('카드 제목을 입력하세요:');

  if (cardName) {
    $.ajax({
      type: 'POST',
      url: `/api/card`,
      data: { columnId, name: cardName },
      success: (data) => {
        console.log(data);
        alert('카드가 추가되었습니다.');
      },
      error: (error) => {
        alert(error.responseJSON.error);
      },
    });
  }
}

function deleteCard(event) {
  const button = event.target;
  const cardId = button.getAttribute('deleteCardId');

  $.ajax({
    type: 'DELETE',
    url: `/api/card/${cardId}`,
    success: (data) => {
      console.log(data);
      alert(data.message);
      getCards();
    },
    error: (error) => {
      alert(error.responseJSON.error);
    },
  });
}

function editCard(event) {
  const button = event.target;
  const cardId = button.getAttribute('editCardId');
}

function moveCard(event) {
  const button = event.target;
  const cardId = button.getAttribute('moveCardId');
}

const commentEl = document.querySelector('.comment');

const getData = async () => {
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

getData(); // 초기 데이터 로드

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
