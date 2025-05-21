// comments.js
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    const list = document.getElementById('comment-list');
    const item = document.createElement('li');
    item.innerHTML = `<strong>${username}:</strong> ${comment}`;
    list.appendChild(item);
    this.reset();
  });
  