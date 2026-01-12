const modal = document.getElementById('myModal');
const openBtn = document.getElementById('openModal');
const closeButtons = document.querySelectorAll('.close-btn');


const openModal = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; 
};


const closeModal = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; 
};


openBtn.addEventListener('click', openModal);

closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
});


modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});


window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});


const confirmBtn = document.getElementById('confirmAction');
if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
        console.log('Action confirmée');
        closeModal();
    });
}
