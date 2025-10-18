/**
 * main.js
 * * This file contains the core JavaScript functionality for the SKC website.
 * It handles UI interactions such as the mobile menu, modals, and form submissions.
 * The Lucide icons are initialized here as well.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide Icons
    lucide.createIcons();

    // --- Mobile Menu Functionality ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Close menu when a link is clicked
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // --- Team Tabs Logic ---
    const tabsContainer = document.getElementById('team-tabs');
    if (tabsContainer) {
        const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabsContainer.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.tab-btn');
            if (!clickedButton) return;

            const tab = clickedButton.dataset.tab;

            // Deactivate all buttons and content
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-[#1a237e]', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
                btn.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Activate the clicked button and corresponding content
            clickedButton.classList.add('active', 'bg-[#1a237e]', 'text-white');
            clickedButton.classList.remove('bg-gray-200', 'text-gray-700');
            clickedButton.setAttribute('aria-selected', 'true');
            
            const activeContent = document.getElementById(`${tab}-content`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    }

    // --- Universal Modal Handling ---
    const setupModal = (openBtnId, closeBtnId, modalId) => {
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const modal = document.getElementById(modalId);
        const modalContent = modal ? modal.querySelector('.modal-content') : null;

        if (!openBtn || !closeBtn || !modal || !modalContent) return;

        const openModal = () => {
            modal.classList.remove('hidden', 'pointer-events-none');
            modal.classList.add('flex');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modalContent.classList.remove('scale-95');
            }, 10);
        };

        const closeModal = () => {
            modal.classList.add('opacity-0');
            modalContent.classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden', 'pointer-events-none'), 300);
        };

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => (e.target === modal) && closeModal());
        return { closeModal };
    };

    // Initialize Admission Modal
    const { closeModal: closeAdmissionModal } = setupModal('open-admission-modal', 'close-admission-modal', 'admission-modal');
    
    // Initialize Email Modal
    const { closeModal: closeEmailModal } = setupModal('open-email-modal-btn', 'close-email-modal-btn', 'email-modal');

    // --- WhatsApp Inquiry Form Logic ---
    const whatsappForm = document.getElementById('whatsapp-inquiry-form');
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const parentName = document.getElementById('parent-name').value;
            const relation = document.getElementById('relation').value;
            const standard = document.getElementById('standard').value;
            const branch = document.getElementById('branch').value;
            const phoneNumber = "918390251424";

            let message = `Hello, I'm contacting you from the SKC Groups of School website. I would like to inquire about admission.%0A%0A`;
            message += `*Contact Name:* ${encodeURIComponent(parentName)}%0A`;
            message += `*Relation to Student:* ${encodeURIComponent(relation)}%0A`;
            message += `*Admission For:* ${encodeURIComponent(standard)}%0A`;
            message += `*Preferred Branch:* ${encodeURIComponent(branch)}%0A%0A`;
            message += `Please provide further details.`;
            
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(whatsappURL, '_blank');
        });
    }

    // --- Custom Email Inquiry Form Logic ---
    const emailForm = document.getElementById('email-inquiry-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const senderName = document.getElementById('email-sender-name').value;
            const subject = document.getElementById('email-subject').value || 'General Inquiry from SKC Website';
            const messageBody = document.getElementById('email-message').value || 'Hello SKC Admissions Team,\n\nI am writing to inquire about the details mentioned in the subject line. Please provide me with the necessary information.\n\nThank you,\n\n';
            
            const finalSubject = encodeURIComponent(`[SKC Website Inquiry] - ${subject}`);
            const finalBody = encodeURIComponent(`Sender Name: ${senderName}\n\n--- Inquiry Details ---\n\n${messageBody}`);
            
            const emailAddress = "skcjuniorcollege12@gmail.com";
            const mailtoURL = `mailto:${emailAddress}?subject=${finalSubject}&body=${finalBody}`;

            window.location.href = mailtoURL;
            if (closeEmailModal) closeEmailModal();
        });
    }
});