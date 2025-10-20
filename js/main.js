/**
 * main.js
 * * This file contains the core JavaScript functionality for the SKC website.
 * It handles UI interactions such as the mobile menu, modals, and form submissions.
 * The Lucide icons are initialized here as well.
 *
 * * [UPDATED on Oct 20, 2025] - Implemented dynamic/conditional admission enquiry form.
 * * [UPDATED on Oct 19, 2025] - Added script to deter code inspection.
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

    // --- Dynamic Admission Form Logic ---
    const admissionCategory = document.getElementById('admission-category');
    const schoolFields = document.getElementById('school-fields');
    const jcFields = document.getElementById('jc-fields');
    const degreeFields = document.getElementById('degree-fields');
    
    const schoolSelect = document.getElementById('standard-school');
    const jcSelect = document.getElementById('standard-jc');
    const degreeYearSelect = document.getElementById('degree-year');
    const degreeCourseSelect = document.getElementById('degree-course');

    if (admissionCategory) {
        admissionCategory.addEventListener('change', function() {
            const category = this.value;

            // Hide all dynamic fields first
            schoolFields.classList.add('hidden');
            jcFields.classList.add('hidden');
            degreeFields.classList.add('hidden');
            
            // Remove 'required' attribute from all selects
            schoolSelect.required = false;
            jcSelect.required = false;
            degreeYearSelect.required = false;
            degreeCourseSelect.required = false;

            // Show the relevant fields and set required attribute
            if (category === 'school') {
                schoolFields.classList.remove('hidden');
                schoolSelect.required = true;
            } else if (category === 'jc') {
                jcFields.classList.remove('hidden');
                jcSelect.required = true;
            } else if (category === 'degree') {
                degreeFields.classList.remove('hidden');
                degreeYearSelect.required = true;
                degreeCourseSelect.required = true;
            }
        });
    }


    // --- WhatsApp Enquiry Form Logic ---
    const whatsappForm = document.getElementById('whatsapp-enquiry-form');
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // General Info
            const parentName = document.getElementById('parent-name').value;
            const relation = document.getElementById('relation').value;
            const branch = document.getElementById('branch').value;
            const phoneNumber = "918390251424";

            // Dynamic Info
            const category = admissionCategory.value;
            let admissionDetails = '';

            if (category === 'school') {
                admissionDetails = `*Admission For:* School - ${schoolSelect.value}`;
            } else if (category === 'jc') {
                admissionDetails = `*Admission For:* Junior College - ${jcSelect.value}`;
            } else if (category === 'degree') {
                admissionDetails = `*Admission For:* Degree College - ${degreeYearSelect.value} of ${degreeCourseSelect.value}`;
            } else {
                // This case should not be hit if the form is filled correctly, but it's good practice.
                alert("Please select an admission category.");
                return;
            }

            // Construct Message
            let message = `Hello, I'm contacting you from the SKC Groups of School website. I would like to inquire about admission.%0A%0A`;
            message += `*Contact Name:* ${encodeURIComponent(parentName)}%0A`;
            message += `*Relation to Student:* ${encodeURIComponent(relation)}%0A`;
            message += `${encodeURIComponent(admissionDetails)}%0A`;
            message += `*Preferred Branch:* ${encodeURIComponent(branch)}%0A%0A`;
            message += `Please provide further details.`;
            
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(whatsappURL, '_blank');
        });
    }

    // --- Custom Email Enquiry Form Logic ---
    const emailForm = document.getElementById('email-enquiry-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const senderName = document.getElementById('email-sender-name').value;
            const subject = document.getElementById('email-subject').value || 'General Enquiry from SKC Website';
            const messageBody = document.getElementById('email-message').value || 'Hello SKC Admissions Team,\n\nI am writing to inquire about the details mentioned in the subject line. Please provide me with the necessary information.\n\nThank you,\n\n';
            
            const finalSubject = encodeURIComponent(`[SKC Website Enquiry] - ${subject}`);
            const finalBody = encodeURIComponent(`Sender Name: ${senderName}\n\n--- Enquiry Details ---\n\n${messageBody}`);
            
            const emailAddress = "skcjuniorcollege12@gmail.com";
            const mailtoURL = `mailto:${emailAddress}?subject=${finalSubject}&body=${finalBody}`;

            window.location.href = mailtoURL;
            if (closeEmailModal) closeEmailModal();
        });
    }

    // --- Disable Inspect Element ---
    // **IMPORTANT NOTE:** This is not a real security measure. It only deters casual users.
    // Anyone with basic browser knowledge can still access the code.

    // Disable Right-Click
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Disable Keyboard Shortcuts for Developer Tools
    document.addEventListener('keydown', event => {
        // Disable F12
        if (event.keyCode === 123) {
            event.preventDefault();
        }
        // Disable Ctrl+Shift+I (Inspect)
        if (event.ctrlKey && event.shiftKey && event.key === 'I') {
            event.preventDefault();
        }
        // Disable Ctrl+Shift+J (Console)
        if (event.ctrlKey && event.shiftKey && event.key === 'J') {
            event.preventDefault();
        }
        // Disable Ctrl+U (View Source)
        if (event.ctrlKey && event.key === 'U') {
            event.preventDefault();
        }
    });

});