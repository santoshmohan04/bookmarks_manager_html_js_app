import { bookmarksdata } from "./data";

const bookmarksData = bookmarksdata;

let currentPage = 1;
const itemsPerPage = 6;
let filteredData = [];

const defaultIcon = "https://via.placeholder.com/32?text=B"; // Default icon URL

const displayBookmarks = (data, page = 1) => {
  const bookmarksContainer = document.getElementById('bookmarks-container');
  bookmarksContainer.innerHTML = '';

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = data.slice(start, end);

  const categorizedData = paginatedData.reduce((acc, bookmark) => {
    const folderTitle = bookmark.folderTitle || 'Uncategorized';
    if (!acc[folderTitle]) {
      acc[folderTitle] = [];
    }
    acc[folderTitle].push(bookmark);
    return acc;
  }, {});

  Object.keys(categorizedData).forEach(folderTitle => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder-title';
    folderDiv.innerHTML = `<h3>${folderTitle}</h3>`;
    bookmarksContainer.appendChild(folderDiv);

    const row = document.createElement('div');
    row.className = 'row';
    categorizedData[folderTitle].forEach(bookmark => {
      const col = document.createElement('div');
      col.className = 'col-md-4';

      const card = document.createElement('div');
      card.className = 'card bookmark-card';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      cardTitle.textContent = bookmark.title;

      const cardIcon = document.createElement('img');
      cardIcon.className = 'bookmark-icon';
      cardIcon.src = bookmark.icon || defaultIcon;

      const cardLink = document.createElement('a');
      cardLink.href = bookmark.url;
      cardLink.target = '_blank';
      cardLink.textContent = 'Open';
      cardLink.className = 'btn btn-primary btn-sm';

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'btn btn-danger btn-sm';
      deleteButton.onclick = () => deleteBookmark(bookmark.title);

      cardBody.appendChild(cardIcon);
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardLink);
      cardBody.appendChild(deleteButton);

      card.appendChild(cardBody);
      col.appendChild(card);
      row.appendChild(col);
    });
    bookmarksContainer.appendChild(row);
  });

  displayPagination(data.length);
};

const displayPagination = (totalItems) => {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
    pagination.appendChild(li);
  }
};

const changePage = (page) => {
  currentPage = page;
  displayBookmarks(filteredData, currentPage);
};

const deleteBookmark = (title) => {
  const index = filteredData.findIndex(bookmark => bookmark.title === title);
  if (index !== -1) {
    filteredData.splice(index, 1);
    displayBookmarks(filteredData, currentPage);
  }
};

const addBookmark = (title, url, icon, folderTitle) => {
  const folder = bookmarksData.find(folder => folder.title === folderTitle);
  if (folder) {
    folder.children.push({ type: 'link', title, url, icon });
  } else {
    bookmarksData.push({
      type: 'folder',
      title: folderTitle,
      children: [{ type: 'link', title, url, icon }]
    });
  }
  filteredData = bookmarksData.flatMap(folder => folder.children.map(child => ({ ...child, folderTitle: folder.title })));
  displayBookmarks(filteredData, currentPage);
};

const addCategory = (title) => {
  bookmarksData.push({
    type: 'folder',
    title,
    children: []
  });
  updateFolderOptions();
  filteredData = bookmarksData.flatMap(folder => folder.children.map(child => ({ ...child, folderTitle: folder.title })));
  displayBookmarks(filteredData, currentPage);
};

const filterBookmarks = (query) => {
  filteredData = bookmarksData.flatMap(folder => folder.children.map(child => ({ ...child, folderTitle: folder.title })))
    .filter(bookmark => bookmark.title.toLowerCase().includes(query.toLowerCase()));
  displayBookmarks(filteredData, 1);
};

const updateFolderOptions = () => {
  const folderSelect = document.getElementById('bookmarkFolder');
  folderSelect.innerHTML = bookmarksData.map(folder => `<option value="${folder.title}">${folder.title}</option>`).join('');
};

document.getElementById('search').addEventListener('input', (e) => {
  filterBookmarks(e.target.value);
});

document.getElementById('addBookmarkForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('bookmarkTitle').value;
  const url = document.getElementById('bookmarkURL').value;
  const icon = document.getElementById('bookmarkIcon').value || defaultIcon;
  const folderTitle = document.getElementById('bookmarkFolder').value;
  addBookmark(title, url, icon, folderTitle);
  document.getElementById('addBookmarkForm').reset();
  document.querySelector('#addBookmarkModal .btn-close').click();
});

document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('categoryTitle').value;
  addCategory(title);
  document.getElementById('addCategoryForm').reset();
  document.querySelector('#addCategoryModal .btn-close').click();
});

// Initial setup
filteredData = bookmarksData.flatMap(folder => folder.children.map(child => ({ ...child, folderTitle: folder.title })));
updateFolderOptions();
displayBookmarks(filteredData);