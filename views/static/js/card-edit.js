const cardId = window.location.pathname.split('/')[2];
const nameInputEl = document.querySelector('.name-input');
const contentInputEl = document.querySelector('.content-input');
const colorEl = document.querySelector('.color');
const editBtn = document.querySelector('.edit-btn');

let colorValue = 'WHITE';
const getData = async () => {
  const response = await fetch(`/api/cards/${cardId}`);
  const { data } = await response.json();
  console.log(data);
  const { name, content, endDate: endDateData } = data;
  nameInputEl.value = name;
  contentInputEl.value = content;

  const selectChange = () => {
    colorValue = colorEl.options[colorEl.selectedIndex].value;
  };
  colorEl.addEventListener('change', selectChange);
};
getData();

editBtn.addEventListener('click', async () => {
  const response = await fetch(`/api/card/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameInputEl.value,
      content: contentInputEl.value,
      color: colorValue,
      endDate: '2023-09-01',
    }),
  });
  const data = await response.json();
  console.log(data.ok);
  if (data.ok) {
    window.location.href = `/cards/${cardId}`;
  }
});
