// =============================================
// GLOBAL VARIABLES
// =============================================
const isLoginPage = document.querySelector('.login_card') !== null;
const isHomePage = document.querySelector('.navbar') !== null && !isLoginPage;

// =============================================
// HOME PAGE LOGIC
// =============================================
if (isHomePage) {
    const loginBtn = document.querySelector('.loginbtn');

    // Cek apakah user udah login (ada email di sessionStorage)
    const savedEmail = sessionStorage.getItem('userEmail');

    if (savedEmail && savedEmail !== '') {
        // Ambil kata pertama sebelum titik pertama atau @
        const firstName = savedEmail.split('@')[0].split('.')[0];
        loginBtn.textContent = firstName;
        loginBtn.style.cursor = 'default';
        // Remove click event
        loginBtn.onclick = null;
    } else {
        // Kalau belum login, klik login → pergi ke login page
        loginBtn.onclick = function() {
            window.location.href = 'loginpage.html';
        };
    }
}

// =============================================
// LOGIN PAGE LOGIC
// =============================================
if (isLoginPage) {
    const loginUserBtn = document.querySelector('.loginuser');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');

    const emailpasswordDiv = document.querySelector('.emailpassword');

    const errorMsg = document.createElement('p');
    errorMsg.id = 'error-msg';
    errorMsg.style.cssText = `
        color: #fff;
        background-color: #c0392b;
        padding: 8px 12px;
        margin-top: 8px;
        border-radius: 4px;
        font-size: 13px;
        display: none;
    `;
    if (emailpasswordDiv) {
        emailpasswordDiv.insertAdjacentElement('afterend', errorMsg);
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }

    function hideError() {
        errorMsg.style.display = 'none';
    }

    if (loginUserBtn) {
        loginUserBtn.onclick = function() {
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!email && !password) {
                showError('Email dan password tidak boleh kosong!');
                return;
            }

            if (!email) {
                showError('Email tidak boleh kosong!');
                return;
            }

            if (!password) {
                showError('Password tidak boleh kosong!');
                return;
            }

            if (!email.endsWith('@binus.ac.id')) {
                showError('Email hanya bisa menggunakan @binus.ac.id!');
                return;
            }

            hideError();
            sessionStorage.setItem('userEmail', email);
            window.location.href = 'homepage.html';
        };
    }

    if (emailInput) emailInput.addEventListener('input', hideError);
    if (passwordInput) passwordInput.addEventListener('input', hideError);
}

// =============================================
// RESERVATION PAGE LOGIC
// =============================================
const units = {
    discussion: ['Discussion Room 1', 'Discussion Room 2'],
    theater: ['Mini Theater']
};

function updateUnit() {
    const type = document.getElementById('res-type');
    if (!type) return;
    const sel = document.getElementById('res-unit');
    if (!sel) return;
    sel.innerHTML = '';
    sel.disabled = false;
    const selectedType = type.value;
    if (units[selectedType]) {
        units[selectedType].forEach(u => {
            const o = document.createElement('option');
            o.value = u;
            o.textContent = u;
            sel.appendChild(o);
        });
    }
}

function handleSlotChange(checkbox) {
    const checked = document.querySelectorAll('input[name=slot]:checked');
    const maxMsg = document.getElementById('slot-max-msg');
    if(checked.length > 2){
        checkbox.checked = false;
        if(maxMsg) maxMsg.style.display = 'block';
    }else{
        if(maxMsg) maxMsg.style.display = 'none';
    }
    // Remaining slot di disable jika sudah memilih 2 slot
    const allSlots = document.querySelectorAll('input[name=slot]');
    const nowChecked = document.querySelectorAll('input[name=slot]:checked');
    allSlots.forEach(s => {
        if(!s.checked){
            s.disabled = nowChecked.length >= 2;
            s.closest('.time-opt').style.opacity = nowChecked.length >= 2 ? '0.45' : '1';
        }
    });
}

function handleCancel() {
    if (confirm('Reset semua isian form?')) {
        const dateInput = document.getElementById('res-date');
        const locationSelect = document.getElementById('res-location');
        const typeSelect = document.getElementById('res-type');
        const unitSelect = document.getElementById('res-unit');
        const slots = document.querySelectorAll('input[name=slot]');
        const idInput = document.getElementById('res-id');
        const nameInput = document.getElementById('res-name');
        const purposeInput = document.getElementById('res-purpose');
        const maxMsg = document.getElementById('slot-max-msg');
        
        if (dateInput) dateInput.value = '';
        if (locationSelect) locationSelect.selectedIndex = 0;
        if (typeSelect) typeSelect.selectedIndex = 0;
        if (unitSelect) {
            unitSelect.innerHTML = '<option value="" disabled selected>Pilih tipe dulu</option>';
            unitSelect.disabled = true;
        }
        slots.forEach(s => {
            s.checked = false;
            s.disabled = false;
            s.closest('.time-opt').style.opacity = '1';
        });
        if (maxMsg) maxMsg.style.display = 'none';
        if (idInput) idInput.value = '';
        if (nameInput) nameInput.value = '';
        if (purposeInput) purposeInput.value = '';
    }
}

function handleSave() {
    const date = document.getElementById('res-date');
    const loc = document.getElementById('res-location');
    const type = document.getElementById('res-type');
    const unit = document.getElementById('res-unit');
    const checkedSlots = document.querySelectorAll('input[name=slot]:checked');
    const mid = document.getElementById('res-id');
    const name = document.getElementById('res-name');
    const purpose = document.getElementById('res-purpose');

    if (!date || !loc || !type || !unit || !mid || !name || !purpose) return;

    const dateVal = date.value;
    const locVal = loc.value;
    const typeVal = type.value;
    const unitVal = unit.value;
    const midVal = mid.value.trim();
    const nameVal = name.value.trim();
    const purposeVal = purpose.value.trim();

    if (!dateVal || !locVal || !typeVal || !unitVal || checkedSlots.length === 0 || !midVal || !nameVal || !purposeVal) {
        alert('Mohon lengkapi semua field sebelum menyimpan.');
        return;
    }

    const slotValues = Array.from(checkedSlots).map(s => s.value).join(', ');
    alert(`✅ Reservasi berhasil disimpan!\n\n📅 ${dateVal}\n📍 ${locVal}\n🏠 ${unitVal} (${slotValues})\n👤 ${nameVal} (${midVal})\n📝 ${purposeVal}`);
}

// =============================================
// HOMEPAGE ADVANCED SEARCH FUNCTIONS
// =============================================
let extraRowVisible = false;

// Fungsi untuk update input di homepage berdasarkan pilihan Collection Type
function updateHomeSearchInput(selectElement, targetInputId) {
    if (!selectElement) return;
    const selectedType = selectElement.value;
    const targetInput = document.getElementById(targetInputId);
    if (!targetInput) return;
    
    if (selectedType === 'Collection Type') {
        // Ganti input text menjadi select dropdown
        const select = document.createElement('select');
        select.id = targetInputId;
        select.className = 'search-input';
        select.innerHTML = `
            <option value="Textbook">Textbook</option>
            <option value="E-book">E-book</option>
            <option value="E-article">E-article</option>
        `;
        targetInput.parentNode.replaceChild(select, targetInput);
    } else {
        // Ganti select menjadi input text
        const input = document.createElement('input');
        input.type = 'text';
        input.id = targetInputId;
        input.className = 'search-input';
        input.placeholder = `Type ${selectedType} here...`;
        targetInput.parentNode.replaceChild(input, targetInput);
    }
}

function addSearchRow() {
    const extraRow = document.getElementById('extra-search-row');
    if (!extraRow) return;
    if (extraRowVisible) {
        extraRow.style.display = 'none';
        extraRowVisible = false;
        const addBtn = document.querySelector('.add-row');
        if (addBtn) addBtn.textContent = '+';
    } else {
        extraRow.style.display = 'block';
        extraRowVisible = true;
        const addBtn = document.querySelector('.add-row');
        if (addBtn) addBtn.textContent = '−';
    }
}

function clearHomeSearch() {
    const searchType = document.getElementById('home-search-type');
    const searchValue = document.getElementById('home-search-value');
    const sortBy = document.getElementById('home-sort-by');
    const searchType2 = document.getElementById('home-search-type2');
    const searchValue2 = document.getElementById('home-search-value2');
    
    if (searchType) searchType.value = 'Title';
    if (searchValue) {
        // Reset ke input text
        if (searchValue.tagName === 'SELECT') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'home-search-value';
            input.className = 'search-input';
            input.placeholder = 'Type here...';
            searchValue.parentNode.replaceChild(input, searchValue);
        } else {
            searchValue.value = '';
        }
    }
    if (sortBy) sortBy.value = 'Newest';
    
    if (extraRowVisible) {
        if (searchType2) searchType2.value = 'Title';
        if (searchValue2) {
            if (searchValue2.tagName === 'SELECT') {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'home-search-value2';
                input.className = 'search-input';
                input.placeholder = 'Type here...';
                searchValue2.parentNode.replaceChild(input, searchValue2);
            } else {
                searchValue2.value = '';
            }
        }
    }
    
    sessionStorage.removeItem('searchParams');
}

function searchAndRedirect() {
    const searchType1 = document.getElementById('home-search-type');
    const searchValue1 = document.getElementById('home-search-value');
    const sortBy = document.getElementById('home-sort-by');
    
    if (!searchType1 || !searchValue1 || !sortBy) return;
    
    const type1 = searchType1.value;
    let value1 = searchValue1.value;
    if (searchValue1.tagName === 'SELECT') {
        value1 = searchValue1.value;
    }
    
    const sort = sortBy.value;
    
    let searchType2 = null;
    let searchValue2 = null;
    
    if (extraRowVisible) {
        const type2El = document.getElementById('home-search-type2');
        const value2El = document.getElementById('home-search-value2');
        if (type2El && value2El) {
            let val2 = value2El.value;
            if (val2 && val2.trim() !== '') {
                searchType2 = type2El.value;
                searchValue2 = val2;
            }
        }
    }
    
    const searchParams = {
        searchType1: type1,
        searchValue1: value1,
        searchType2: searchType2,
        searchValue2: searchValue2,
        sortBy: sort
    };
    
    sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
    window.location.href = 'collectionpage.html';
}

// Event listener untuk homepage search type
document.addEventListener('DOMContentLoaded', function() {
    const homeSearchType = document.getElementById('home-search-type');
    if (homeSearchType) {
        homeSearchType.addEventListener('change', function() {
            updateHomeSearchInput(this, 'home-search-value');
        });
    }
    
    const homeSearchType2 = document.getElementById('home-search-type2');
    if (homeSearchType2) {
        homeSearchType2.addEventListener('change', function() {
            updateHomeSearchInput(this, 'home-search-value2');
        });
    }
});

// =============================================
// FILTER POPUP FUNCTIONS (untuk collection page)
// =============================================
function openFilter() { 
    const overlay = document.getElementById('fpOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function closeFilter() { 
    const overlay = document.getElementById('fpOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function closeOnOverlay(e) {
    // Cek apakah target yang diklik memiliki class atau parent dari year-chips-scroll
    const isDraggingYear = e.target.closest('.year-chips-scroll');
    
    // Jika lagi berinteraksi dengan year picker, jangan tutup popup
    if (isDraggingYear) {
        return;
    }
    
    if (e.target === document.getElementById('fpOverlay')) {
        closeFilter();
    }
}

function toggleChip(el) { 
    if (el) el.classList.toggle('active'); 
}

function buildYearPicker(containerId, selectedVal = null) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    
    // Tahun dari 2015 sampai 2026
    for (let y = 2015; y <= 2026; y++) {
        const btn = document.createElement('button');
        // Tidak ada active class kalau selectedVal null
        btn.className = 'year-chip';
        btn.textContent = y;
        btn.dataset.year = y;
        btn.onclick = function(e) {
            e.stopPropagation();
            // Toggle: jika sudah active, hapus; jika belum, tambah
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
            } else {
                el.querySelectorAll('.year-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        };
        el.appendChild(btn);
    }

    // Drag to scroll (sama seperti sebelumnya)
    let isDragging = false;
    let startX, scrollLeft;
    
    el.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        isDragging = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        el.style.cursor = 'grab';
    });
    
    el.addEventListener('mouseleave', function() {
        isDragging = false;
        el.style.cursor = 'grab';
    });
    
    el.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.2;
        el.scrollLeft = scrollLeft - walk;
    });
}

function resetYearPicker(containerId, defaultVal) {
    const container = document.getElementById(containerId);
    if (container) {
        container.querySelectorAll('.year-chip').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.year) === defaultVal);
        });
    }
}

function resetFilter() {
    // Reset semua chip (bahasa, kategori, rating)
    const chips = document.querySelectorAll('#fpOverlay .fp-chip');
    chips.forEach(c => c.classList.remove('active'));
    
    // Reset tahun (kosongkan semua pilihan) - pertahankan cara asli Anda
    document.querySelectorAll('#startYearPicker .year-chip, #endYearPicker .year-chip').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tampilkan semua buku
    const allBooks = document.querySelectorAll('.book-card');
    allBooks.forEach(book => {
        book.style.display = 'flex';
    });
    
    // Optional: reset search jika perlu
    const searchType1 = document.getElementById('col-search-type1');
    if (searchType1 && searchType1.value !== 'Title') {
        searchType1.value = 'Title';
        if (typeof updateSearchInput === 'function') {
            updateSearchInput(searchType1, 'col-search-input1-container');
        }
    }
    
    const searchValue1 = document.getElementById('col-search-value1');
    if (searchValue1 && searchValue1.value) {
        if (searchValue1.tagName === 'SELECT') {
            searchValue1.selectedIndex = 0;
        } else {
            searchValue1.value = '';
        }
    }
    
    // Jalankan search ulang jika ada fungsi performCollectionSearch
    if (typeof performCollectionSearch === 'function') {
        performCollectionSearch();
    }
}

function applyFilter() {
    // CARI SECTION BERDASARKAN TEKS, BUKAN URUTAN
    
    // Cari section Bahasa (chip yang berisi ID, English, CN)
    const allSections = document.querySelectorAll('#fpOverlay .fp-section');
    let languageSection = null;
    let categorySection = null;
    let ratingSection = null;
    
    allSections.forEach(section => {
        const label = section.querySelector('.fp-label')?.textContent;
        if (label === 'Language') languageSection = section;
        if (label === 'Category') categorySection = section;
        if (label === 'Rating') ratingSection = section;
    });
    
    // Ambil chip aktif dari masing-masing section
    const selectedLanguages = languageSection ? 
        Array.from(languageSection.querySelectorAll('.fp-chip.active')).map(c => c.textContent) : [];
    
    const selectedCategories = categorySection ? 
        Array.from(categorySection.querySelectorAll('.fp-chip.active')).map(c => c.textContent) : [];
    
    const selectedRatings = ratingSection ? 
        Array.from(ratingSection.querySelectorAll('.fp-chip.active')).map(c => c.textContent) : [];
    
    // Ambil filter tahun
    const startYearChip = document.querySelector('#startYearPicker .year-chip.active');
    const endYearChip = document.querySelector('#endYearPicker .year-chip.active');
    const selectedStartYear = startYearChip ? startYearChip.dataset.year : null;
    const selectedEndYear = endYearChip ? endYearChip.dataset.year : null;
    
    const allBooks = document.querySelectorAll('.book-card');
    
    allBooks.forEach(book => {
        let show = true;
        
        const bookLang = book.querySelector('.lang-badge')?.textContent || '';
        const bookCategory = book.querySelector('.book-type-badge')?.textContent || '';
        const bookRating = parseFloat(book.getAttribute('data-rating'));
        const bookYear = parseInt(book.getAttribute('data-year'));
        
        // FILTER BAHASA
        if (selectedLanguages.length > 0 && !selectedLanguages.includes(bookLang)) {
            show = false;
        }
        
        // FILTER KATEGORI
        if (show && selectedCategories.length > 0 && !selectedCategories.includes(bookCategory)) {
            show = false;
        }
        
        // FILTER RATING
        if (show && selectedRatings.length > 0) {
            let ratingMatch = false;
            for (const rt of selectedRatings) {
                if (rt === '⭐ 5–4' && bookRating >= 4) ratingMatch = true;
                if (rt === '⭐ 4–3' && bookRating >= 3 && bookRating < 4) ratingMatch = true;
                if (rt === '⭐ 3–2' && bookRating >= 2 && bookRating < 3) ratingMatch = true;
                if (rt === '⭐ 2–1' && bookRating >= 1 && bookRating < 2) ratingMatch = true;
                if (rt === '⭐ 1–0' && bookRating >= 0 && bookRating < 1) ratingMatch = true;
            }
            if (!ratingMatch) show = false;
        }
        
        // FILTER TAHUN
        if (show && selectedStartYear && selectedEndYear) {
            if (bookYear < parseInt(selectedStartYear) || bookYear > parseInt(selectedEndYear)) {
                show = false;
            }
        }
        
        book.style.display = show ? 'flex' : 'none';
    });
    
    closeFilter();
}

// =============================================
// COLLECTION PAGE FUNCTIONS
// =============================================
let collectionExtraVisible = false;

function toggleCollectionExtraSearch() {
    const extraDiv = document.getElementById('col-extra-search');
    if (!extraDiv) return;
    if (collectionExtraVisible) {
        extraDiv.style.display = 'none';
        collectionExtraVisible = false;
    } else {
        extraDiv.style.display = 'block';
        collectionExtraVisible = true;
    }
}

function updateSearchInput(selectElement, targetContainerId) {
    if (!selectElement || !targetContainerId) return;
    const selectedType = selectElement.value;
    const container = document.getElementById(targetContainerId);
    if (!container) return;
    
    if (selectedType === 'Collection Type') {
        const inputId = targetContainerId === 'col-search-input1-container' ? 'col-search-value1' : 'col-search-value2';
        container.innerHTML = `
            <select id="${inputId}" class="field-select">
                <option value="Textbook">Textbook</option>
                <option value="E-book">E-book</option>
                <option value="E-article">E-article</option>
            </select>
        `;
    } else {
        const inputId = targetContainerId === 'col-search-input1-container' ? 'col-search-value1' : 'col-search-value2';
        container.innerHTML = `<input type="text" id="${inputId}" class="field-input" placeholder="Type ${selectedType} here...">`;
    }
}

function performCollectionSearch() {
    const type1Select = document.getElementById('col-search-type1');
    if (!type1Select) return;
    
    const searchType1 = type1Select.value;
    let searchValue1 = '';
    const valueEl1 = document.getElementById('col-search-value1');
    if (valueEl1) {
        if (valueEl1.tagName === 'SELECT') {
            searchValue1 = valueEl1.value;
        } else {
            searchValue1 = valueEl1.value.trim().toLowerCase();
        }
    }
    
    let searchType2 = null;
    let searchValue2 = null;
    if (collectionExtraVisible) {
        const type2Select = document.getElementById('col-search-type2');
        if (type2Select) searchType2 = type2Select.value;
        const valueEl2 = document.getElementById('col-search-value2');
        if (valueEl2) {
            if (valueEl2.tagName === 'SELECT') {
                searchValue2 = valueEl2.value;
            } else {
                searchValue2 = valueEl2.value.trim().toLowerCase();
            }
        }
    }
    
    const sortBy = document.getElementById('col-sort-by');
    const sortValue = sortBy ? sortBy.value : 'Newest';
    
    const allBooks = document.querySelectorAll('.book-card');
    
    allBooks.forEach(book => {
        let match = true;
        
        if (searchValue1 && searchValue1 !== '') {
            match = checkBookMatch(book, searchType1, searchValue1);
        }
        
        if (match && searchValue2 && searchValue2 !== '') {
            match = checkBookMatch(book, searchType2, searchValue2);
        }
        
        book.style.display = match ? 'flex' : 'none';
    });
    
    sortBooks(sortValue);
}

function checkBookMatch(book, searchType, searchValue) {
    const title = book.getAttribute('data-title')?.toLowerCase() || '';
    const author = book.getAttribute('data-author')?.toLowerCase() || '';
    const type = book.getAttribute('data-type') || '';
    const isbn = book.getAttribute('data-isbn')?.toLowerCase() || '';
    
    switch(searchType) {
        case 'Title':
            return title.includes(searchValue);
        case 'Author':
            return author.includes(searchValue);
        case 'Collection Type':
            return type === searchValue;
        case 'ISBN':
            return isbn.includes(searchValue);
        default:
            return true;
    }
}

function sortBooks(sortBy) {
    const textbookSection = document.getElementById('textbook-section');
    const ebookSection = document.getElementById('ebook-section');
    const journalSection = document.getElementById('journal-section');
    
    if (!textbookSection || !ebookSection || !journalSection) return;
    
    const textbookBooks = Array.from(textbookSection.querySelectorAll('.book-card'));
    const ebookBooks = Array.from(ebookSection.querySelectorAll('.book-card'));
    const journalBooks = Array.from(journalSection.querySelectorAll('.book-card'));
    
    function sortSection(books) {
        return books.sort((a, b) => {
            if (sortBy === 'Newest') {
                return parseInt(b.getAttribute('data-year')) - parseInt(a.getAttribute('data-year'));
            } else if (sortBy === 'Oldest') {
                return parseInt(a.getAttribute('data-year')) - parseInt(b.getAttribute('data-year'));
            } else if (sortBy === 'Rating') {
                return parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating'));
            } else if (sortBy === 'Title A-Z') {
                return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
            }
            return 0;
        });
    }
    
    const sortedTextbook = sortSection([...textbookBooks]);
    const sortedEbook = sortSection([...ebookBooks]);
    const sortedJournal = sortSection([...journalBooks]);
    
    sortedTextbook.forEach(book => textbookSection.appendChild(book));
    sortedEbook.forEach(book => ebookSection.appendChild(book));
    sortedJournal.forEach(book => journalSection.appendChild(book));
}

function clearCollectionSearch() {
    const type1Select = document.getElementById('col-search-type1');
    if (type1Select) {
        type1Select.value = 'Title';
        updateSearchInput(type1Select, 'col-search-input1-container');
    }
    
    if (collectionExtraVisible) {
        const extraDiv = document.getElementById('col-extra-search');
        if (extraDiv) extraDiv.style.display = 'none';
        collectionExtraVisible = false;
    }
    
    const sortBy = document.getElementById('col-sort-by');
    if (sortBy) sortBy.value = 'Newest';
    
    const allBooks = document.querySelectorAll('.book-card');
    allBooks.forEach(book => {
        book.style.display = 'flex';
    });
    
    sortBooks('Newest');
}

// =============================================
// INITIALIZATION FOR COLLECTION PAGE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize year pickers
    if (document.getElementById('startYearPicker')) {
        buildYearPicker('startYearPicker');
        buildYearPicker('endYearPicker');
    }
    
    // Initialize collection page search inputs
    const searchType1 = document.getElementById('col-search-type1');
    if (searchType1) {
        updateSearchInput(searchType1, 'col-search-input1-container');
        searchType1.addEventListener('change', function() {
            updateSearchInput(this, 'col-search-input1-container');
        });
    }
    
    const searchType2 = document.getElementById('col-search-type2');
    if (searchType2) {
        updateSearchInput(searchType2, 'col-search-input2-container');
        searchType2.addEventListener('change', function() {
            updateSearchInput(this, 'col-search-input2-container');
        });
    }
    
    // Load saved search dari homepage
    const savedParams = sessionStorage.getItem('searchParams');
    if (savedParams && window.location.pathname.includes('collectionpage.html')) {
        const params = JSON.parse(savedParams);
        
        const type1Select = document.getElementById('col-search-type1');
        if (type1Select && params.searchType1) {
            type1Select.value = params.searchType1;
            updateSearchInput(type1Select, 'col-search-input1-container');
            
            setTimeout(() => {
                const valueInput1 = document.getElementById('col-search-value1');
                if (valueInput1 && params.searchValue1) {
                    if (valueInput1.tagName === 'SELECT') {
                        valueInput1.value = params.searchValue1;
                    } else {
                        valueInput1.value = params.searchValue1;
                    }
                }
            }, 50);
        }
        
        if (params.searchType2 && params.searchValue2) {
            toggleCollectionExtraSearch();
            setTimeout(() => {
                const type2Select = document.getElementById('col-search-type2');
                if (type2Select) {
                    type2Select.value = params.searchType2;
                    updateSearchInput(type2Select, 'col-search-input2-container');
                    
                    setTimeout(() => {
                        const valueInput2 = document.getElementById('col-search-value2');
                        if (valueInput2 && params.searchValue2) {
                            if (valueInput2.tagName === 'SELECT') {
                                valueInput2.value = params.searchValue2;
                            } else {
                                valueInput2.value = params.searchValue2;
                            }
                        }
                    }, 50);
                }
            }, 50);
        }
        
        const sortSelect = document.getElementById('col-sort-by');
        if (sortSelect && params.sortBy) {
            sortSelect.value = params.sortBy;
        }
        
        setTimeout(() => {
            performCollectionSearch();
        }, 100);
    }
});