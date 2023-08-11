const cardId = window.location.pathname.split('/')[2];
const nameInputEl = document.querySelector('.name-input');
const contentInputEl = document.querySelector('.content-input');
const colorEl = document.querySelector('.color');
const editBtn = document.querySelector('.edit-btn');
const dateEl = document.querySelector('.date');

let colorValue = 'WHITE';
const getData = async () => {
  const response = await fetch(`/api/cards/${cardId}`);
  const { data } = await response.json();
  console.log(data);
  const { name, content, endDate: endDateData } = data;
  nameInputEl.value = name;
  contentInputEl.value = content;
  const dateString = new Date(endDateData)
    .toLocaleDateString()
    .split('/')
    .reverse()
    .map((el, index) => {
      if (index !== 0 && el < 10) {
        return '0' + el;
      } else {
        return el;
      }
    })
    .join('-');
  dateEl.value = dateString;
  const selectChange = () => {
    colorValue = colorEl.options[colorEl.selectedIndex].value;
  };
  colorEl.addEventListener('change', selectChange);
};
getData();

// dateEl.addEventListener('change', (e) => {
//   console.log(e.currentTarget.value);
// });

editBtn.addEventListener('click', async () => {
  const response = await fetch(`/api/card/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameInputEl.value,
      content: contentInputEl.value,
      color: colorValue,
      endDate: dateEl.value,
    }),
  });
  const data = await response.json();
  console.log(data.ok);
  if (data.ok) {
    window.location.href = `/cards/${cardId}`;
  }
});
