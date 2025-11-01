// DOM Elements
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const navItems = document.querySelectorAll('.nav-item');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const closeNotificationsBtn = document.getElementById('closeNotifications');

// Toggle Sidebar
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // Update toggle icon
    const icon = toggleSidebarBtn.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
        icon.className = 'fas fa-bars';
    } else {
        icon.className = 'fas fa-times';
    }
});

// Navigation Items
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Get the module name
        const module = item.getAttribute('data-module');
        
        // Handle module switching
        handleModuleSwitch(module);
    });
});

// Handle Module Switching
function handleModuleSwitch(module) {
    console.log(`Switching to ${module} module`);
    
    // Here you would load different content based on the module
    // For now, we'll just update the page title
    const pageHeader = document.querySelector('.page-header h1');
    const moduleNames = {
        'dashboard': 'Dashboard Overview',
        'school': 'School Management',
        'teachers': 'Teachers Management',
        'students': 'Students Management',
        'attendance': 'Attendance Tracking',
        'exams': 'Exams & Results',
        'fees': 'Fees & Finance',
        'communication': 'Communication Center',
        'settings': 'System Settings'
    };
    
    if (pageHeader && moduleNames[module]) {
        pageHeader.textContent = moduleNames[module];
    }
    
    // You can add more logic here to load different content
    // For example, hide/show different sections based on the module
}

// Notification Dropdown Toggle
notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown.classList.toggle('hidden');
});

closeNotificationsBtn.addEventListener('click', () => {
    notificationDropdown.classList.add('hidden');
});

// Close notification dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        notificationDropdown.classList.add('hidden');
    }
});

// Quick Action Buttons
const actionButtons = document.querySelectorAll('.action-btn');
actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const actionText = btn.querySelector('span').textContent;
        showNotification(`${actionText} clicked!`);
    });
});

// Notification System
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 5rem;
        right: 1.5rem;
        background: linear-gradient(135deg, #fb923c, #ec4899);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add Event Button
const addEventBtn = document.querySelector('.add-event-btn');
if (addEventBtn) {
    addEventBtn.addEventListener('click', () => {
        showNotification('Add Event feature coming soon!');
    });
}

// View All Buttons
const viewAllBtns = document.querySelectorAll('.view-all-btn');
viewAllBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        showNotification('View All feature coming soon!');
    });
});

// Search Functionality
const searchInput = document.querySelector('.search-container input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        
        // Here you would implement actual search functionality
        // For now, we'll just log it
        if (searchTerm.length > 2) {
            // Simulate search delay
            setTimeout(() => {
                console.log('Search results for:', searchTerm);
            }, 300);
        }
    });
}

// Activity Item Click Handler
const activityItems = document.querySelectorAll('.activity-item');
activityItems.forEach(item => {
    item.addEventListener('click', () => {
        const title = item.querySelector('.activity-title').textContent;
        showNotification(`Viewing: ${title}`);
    });
});

// Event Item Click Handler
const eventItems = document.querySelectorAll('.event-item');
eventItems.forEach(item => {
    item.addEventListener('click', () => {
        const title = item.querySelector('.event-title').textContent;
        showNotification(`Event: ${title}`);
    });
});

// Stat Cards Hover Effect
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// User Profile Dropdown (Placeholder)
const userProfile = document.querySelector('.user-profile');
if (userProfile) {
    userProfile.addEventListener('click', () => {
        showNotification('Profile menu coming soon!');
    });
}

// Mark notifications as read
const notificationItems = document.querySelectorAll('.notification-item');
notificationItems.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.remove('unread');
        showNotification('Notification marked as read');
    });
});

// Initialize tooltips (optional enhancement)
function initTooltips() {
    const elementsWithTitle = document.querySelectorAll('[title]');
    elementsWithTitle.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const title = e.target.getAttribute('title');
            if (title) {
                // You can create custom tooltips here
                console.log('Tooltip:', title);
            }
        });
    });
}

// Call initialization functions
initTooltips();

// Log initialization
console.log('SchoolOS Admin Dashboard initialized successfully!');

// Responsive sidebar for mobile
function handleResponsiveSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        toggleSidebarBtn.querySelector('i').className = 'fas fa-bars';
    }
}

// Call on load and resize
window.addEventListener('load', handleResponsiveSidebar);
window.addEventListener('resize', handleResponsiveSidebar);

// Prevent default form submissions (if any forms are added later)
document.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Form submitted!');
});

// Add smooth scrolling to all links (if anchor links are added)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Toggle sidebar with Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebarBtn.click();
    }
    
    // Toggle notifications with Ctrl/Cmd + N
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        notificationBtn.click();
    }
    
    // Focus search with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Add loading animation for stat cards
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        
        // Animate number counting (simple version)
        setTimeout(() => {
            stat.style.transition = 'all 0.5s ease';
            stat.textContent = finalValue;
        }, 100);
    });
}

// Call on page load
window.addEventListener('load', () => {
    setTimeout(animateStats, 200);
});

// Add fade-in animation to cards
function fadeInCards() {
    const cards = document.querySelectorAll('.stat-card, .activity-card, .events-card, .quick-actions-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Call on page load
window.addEventListener('load', () => {
    fadeInCards();
});

// Export functions for potential module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        handleModuleSwitch
    };
}