// Global variables
let eventsData = {};
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthColors = {
    january: 'blue', february: 'red', march: 'green', april: 'yellow',
    may: 'green', june: 'yellow', july: 'blue', august: 'orange',
    september: 'gray', october: 'purple', november: 'gray', december: 'red'
};
const monthIcons = {
    january: 'fa-snowflake', february: 'fa-heart', march: 'fa-leaf',
    april: 'fa-umbrella', may: 'fa-tree', june: 'fa-sun',
    july: 'fa-water', august: 'fa-fire', september: 'fa-wind',
    october: 'fa-ghost', november: 'fa-cloud-rain', december: 'fa-gift'
};

function getColorClassForCharacter(character) {
    const colors = ['blue', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'];
    let hash = 0;
    for (let i = 0; i < (character || '').length; i++) {
        hash = character.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    return {
        bg: `bg-${color}-100`,
        text: `text-${color}-800`,
        border: `border-${color}-300`
    };
}

function getCharacterImage(character) {
    const baseUrl = 'https://static.wikia.nocookie.net/p__/images/ ';
    const images = {
        'Reimu Hakurei': '4/45/Reimu_Hakurei_Urban_Legend_in_Limbo.png/revision/latest?cb=20210207093128&path-prefix=protagonist',
        'Marisa Kirisame': 'e/e3/Marisa_Kirisame_urban_legend_in_limbo.png/revision/latest?cb=20210207093130&path-prefix=protagonist',
        'Sakuya Izayoi': 'b/bd/Sakuya_Izayoi_urban_legend_in_limbo.png/revision/latest?cb=20210207093135&path-prefix=protagonist',
        'Remilia Scarlet': 'f/f6/Remilia_Scarlet_urban_legend_in_limbo.png/revision/latest?cb=20210207093140&path-prefix=protagonist',
        'Flandre Scarlet': '7/7a/Flandre_Scarlet_urban_legend_in_limbo.png/revision/latest?cb=20210207093145&path-prefix=protagonist',
        'Cirno': 'c/cf/Cirno_urban_legend_in_limbo.png/revision/latest?cb=20210207093150&path-prefix=protagonist',
        'Yukari Yakumo': 'a/a1/Yukari_Yakumo_urban_legend_in_limbo.png/revision/latest?cb=20210207093155&path-prefix=protagonist',
        'Satori Komeiji': 'd/d1/Satori_Komeiji_urban_legend_in_limbo.png/revision/latest?cb=20210207093200&path-prefix=protagonist',
        'Koishi Komeiji': 'e/e4/Koishi_Komeiji_urban_legend_in_limbo.png/revision/latest?cb=20210207093205&path-prefix=protagonist',
        'Patchouli Knowledge': '0/08/Patchouli_Knowledge_urban_legend_in_limbo.png/revision/latest?cb=20210207093210&path-prefix=protagonist',
        'Alice Margatroid': '1/1d/Alice_Margatroid_urban_legend_in_limbo.png/revision/latest?cb=20210207093215&path-prefix=protagonist',
        'Hong Meiling': '5/52/Hong_Meiling_urban_legend_in_limbo.png/revision/latest?cb=20210207093220&path-prefix=protagonist',
        'Youmu Konpaku': '2/2c/Youmu_Konpaku_urban_legend_in_limbo.png/revision/latest?cb=20210207093225&path-prefix=protagonist',
        'Ran Yakumo': '9/9f/Ran_Yakumo_urban_legend_in_limbo.png/revision/latest?cb=20210207093230&path-prefix=protagonist',
        'Chen': 'c/c4/Chen_urban_legend_in_limbo.png/revision/latest?cb=20210207093235&path-prefix=protagonist',
        'Iku Nagae': '5/57/Iku_Nagae_urban_legend_in_limbo.png/revision/latest?cb=20210207093240&path-prefix=protagonist',
        'default': '4/45/Reimu_Hakurei_Urban_Legend_in_Limbo.png/revision/latest?cb=20210207093128&path-prefix=protagonist'
    };

    // Exact match first
    if (images[character]) {
        return baseUrl + images[character];
    }

    // Fuzzy match
    for (const [key, value] of Object.entries(images)) {
        if (character.toLowerCase().includes(key.toLowerCase())) {
            return baseUrl + value;
        }
    }

    // Default fallback
    return baseUrl + images.default;
}

async function loadEvents() {
    const response = await fetch('events.json');
    const data = await response.json();
    if (!data || !data.events) {
        throw new Error('Invalid event data format');
    }
    eventsData = data;
    renderMonthContent('january');
    console.log('✅ Events loaded successfully');
    return true;
}

function renderMonthContent(month) {
    const monthContentContainer = document.getElementById('monthContentContainer');
    if (!eventsData || !eventsData.events) {
        monthContentContainer.innerHTML = '<div class="loader"></div>';
        return;
    }

    const monthEvents = eventsData.events.filter(event => {
        const eventMonth = parseInt(event.date.split('/')[0]) - 1;
        return monthNames[eventMonth].toLowerCase() === month;
    });

    const monthName = month.charAt(0).toUpperCase() + month.slice(1);
    const monthColor = monthColors[month];
    const colorClasses = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
        red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
        green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
        orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    };

    const monthContent = `
        <div class="month-content active" id="${month}-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fas ${monthIcons[month]} mr-3 text-${monthColor}-500"></i> ${monthName} Events
                </h2>
                <div class="flex space-x-2">
                    <button class="btn btn-secondary px-3 py-1 view-list" title="List View">
                        <i class="fas fa-list"></i>
                    </button>
                    <button class="btn btn-secondary px-3 py-1 view-grid" title="Grid View">
                        <i class="fas fa-th-large"></i>
                    </button>
                    <button class="btn btn-secondary px-3 py-1 sort-date" title="Sort by Date">
                        <i class="fas fa-sort"></i>
                    </button>
                </div>
            </div>

            ${monthEvents.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${monthEvents.map(event => {
                    const primaryCharacter = event.characters[0] || '';
                    const colorClass = getColorClassForCharacter(primaryCharacter);
                    const eventId = `${month}-${event.title.replace(/\s+/g, '-').toLowerCase()}`;

                    return `
                    <div id="${eventId}" class="event-card bg-white rounded-lg shadow p-5">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <span class="inline-block px-3 py-1 ${colorClass.bg} ${colorClass.text} rounded-full text-sm font-medium">
                                    ${formatDate(event.date)}
                                </span>
                                <h3 class="text-xl font-bold mt-2">${event.title}</h3>
                            </div>
                            
                        </div>
                        <p class="text-gray-600 mb-4">${event.details}</p>
                        <div class="flex justify-between items-center text-sm">
                            <span class="${colorClass.text}">
                                <i class="fas fa-users mr-1"></i> ${event.characters.join(', ') || 'Various'}
                            </span>
                            <button class="btn btn-secondary text-xs px-2 py-1 view-details" 
                                    data-event='${JSON.stringify(event)}'>
                                <i class="fas fa-info-circle mr-1"></i> Details
                            </button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            ` : `
            <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4">
                <p>No events found for ${monthName}. Check back later or add a new event!</p>
            </div>
            `}
        </div>
    `;

    monthContentContainer.innerHTML = monthContent;

    // Add event listeners to all buttons in the month content
    setupMonthContentButtons(month);
}

function setupMonthContentButtons(month) {
    // View list button
    document.querySelectorAll('.view-list').forEach(btn => {
        btn.addEventListener('click', function() {
            const grid = document.querySelector('.grid');
            if (!grid) return;

            // Change grid to single column
            grid.classList.remove('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
            grid.classList.add('grid-cols-1');

            // Change card layout to horizontal
            document.querySelectorAll('.event-card').forEach(card => {
                card.classList.add('flex', 'flex-row', 'items-center', 'gap-4');
                const imageContainer = card.querySelector('.flex.justify-between.items-start');
                if (imageContainer) {
                    imageContainer.classList.add('min-w-[150px]');
                }
            });

            // Show toast notification
            showToast('Switched to list view');
        });
    });

    // View grid button
    document.querySelectorAll('.view-grid').forEach(btn => {
        btn.addEventListener('click', function() {
            const grid = document.querySelector('.grid');
            if (!grid) return;

            // Restore original grid layout
            grid.classList.remove('grid-cols-1');
            grid.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');

            // Restore card layout to vertical
            document.querySelectorAll('.event-card').forEach(card => {
                card.classList.remove('flex', 'flex-row', 'items-center');
                card.classList.add('flex-col');
            });

            // Show toast notification
            showToast('Switched to grid view');
        });
    });

    // Sort by date button
    document.querySelectorAll('.sort-date').forEach(btn => {
        btn.addEventListener('click', function() {
            const grid = document.querySelector('.grid');
            if (!grid) return;

            const cards = Array.from(grid.children);
            cards.sort((a, b) => {
                const dateA = a.querySelector('.inline-block').textContent;
                const dateB = b.querySelector('.inline-block').textContent;
                const [monthA, dayA] = dateA.split(' ');
                const [monthB, dayB] = dateB.split(' ');
                const monthIndexA = monthNames.indexOf(monthA);
                const monthIndexB = monthNames.indexOf(monthB);

                if (monthIndexA === monthIndexB) {
                    return parseInt(dayA) - parseInt(dayB);
                }
                return monthIndexA - monthIndexB;
            });

            cards.forEach(card => grid.appendChild(card));

            // Show toast notification
            showToast('Events sorted by date');
        });
    });

    // View details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const event = JSON.parse(e.currentTarget.dataset.event);
            showEventDetails(event);
        });
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function formatDate(dateStr) {
    const [month, day] = dateStr.split('/');
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} ${parseInt(day)}`;
}

function showEventDetails(event) {
    const primaryCharacter = event.characters[0] || '';
    const colorClass = getColorClassForCharacter(primaryCharacter);

    document.getElementById('modalTitle').textContent = event.title;
    document.getElementById('modalDate').textContent = formatDate(event.date);
    document.getElementById('modalDate').className = `inline-block px-3 py-1 ${colorClass.bg} ${colorClass.text} rounded-full text-sm font-medium mr-3`;

    const charactersContainer = document.getElementById('modalCharacters');
    charactersContainer.innerHTML = event.characters.map(char => {
        return `
            <div class="tooltip">
                <img src="${getCharacterImage(char)}" 
                     alt="${char}" 
                     class="character-icon ${colorClass.border} w-10 h-10">
                <span class="tooltip-text">${char}</span>
            </div>
        `;
    }).join('');

    document.getElementById('modalDetails').textContent = event.details;
    document.getElementById('modalSource').textContent = `Source: ${event.source || 'Various'}`;

    // Setup modal buttons
    document.getElementById('shareBtn').addEventListener('click', () => {
        shareEvent(event);
    });

    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('eventModal').style.display = 'block';
}

function shareEvent(event) {
    const shareData = {
        title: event.title,
        text: `${event.title} - ${formatDate(event.date)}\n${event.details}`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch(err => console.error('Error sharing:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        const textToCopy = `${event.title}\nDate: ${formatDate(event.date)}\nCharacters: ${event.characters.join(', ')}\nDetails: ${event.details}\n\nShared from Touhou Events Calendar`;

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showToast('Event details copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                showToast('Failed to share event. Please try again.');
            });
    }
}

function filterEvents(searchTerm) {
    const monthContentContainer = document.getElementById('monthContentContainer');
    const events = eventsData.events || [];
    if (!searchTerm) {
        const currentMonth = monthNames[new Date().getMonth()].toLowerCase();
        renderMonthContent(currentMonth);
        return;
    }

    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.characters.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const searchResults = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                <i class="fas fa-search mr-3"></i> Search Results
            </h2>
        </div>
        ${filteredEvents.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredEvents.map(event => {
                const primaryCharacter = event.characters[0] || '';
                const colorClass = getColorClassForCharacter(primaryCharacter);
                return `
                <div class="event-card bg-white rounded-lg shadow p-5">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <span class="inline-block px-3 py-1 ${colorClass.bg} ${colorClass.text} rounded-full text-sm font-medium">
                                ${formatDate(event.date)}
                            </span>
                            <h3 class="text-xl font-bold mt-2">${event.title}</h3>
                        </div>
                        
                    </div>
                    <p class="text-gray-600 mb-4">${event.details}</p>
                    <div class="flex justify-between items-center text-sm">
                        <span class="${colorClass.text}">
                            <i class="fas fa-users mr-1"></i> ${event.characters.join(', ') || 'Various'}
                        </span>
                        <button class="btn btn-secondary text-xs px-2 py-1 view-details" 
                                data-event='${JSON.stringify(event)}'>
                            <i class="fas fa-info-circle mr-1"></i> Details
                        </button>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        ` : `
        <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4">
            <p>No events found matching "${searchTerm}"</p>
        </div>
        `}
    `;
    monthContentContainer.innerHTML = searchResults;

    // Reattach event listeners to the new buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const event = JSON.parse(e.currentTarget.dataset.event);
            showEventDetails(event);
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const monthContentContainer = document.getElementById('monthContentContainer');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');

    // Theme toggle with localStorage persistence
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = themeToggle.querySelector('.w-12');
    const toggleCircle = toggle.querySelector('div');
    const themeIcon = themeToggle.querySelector('i');

    const updateToggleUI = (isDark) => {
        toggle.classList.toggle('bg-blue-600', isDark);
        toggleCircle.classList.toggle('translate-x-6', isDark);
        themeIcon.className = `fas fa-${isDark ? 'sun' : 'moon'} ${isDark ? 'text-white' : 'text-yellow-500'}`;
    };

    updateToggleUI(savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateToggleUI(!isDark);
        localStorage.setItem('theme', newTheme);
    });

    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterEvents(e.target.value.trim()), 300);
    });

    // Load events and render initial content
    try {
        await loadEvents();
        const currentMonth = monthNames[new Date().getMonth()].toLowerCase();
        document.querySelector(`[data-month="${currentMonth}"]`)?.classList.add('active');
        renderMonthContent(currentMonth);
    } catch (error) {
        console.error('Error during initialization:', error);
        monthContentContainer.innerHTML = `
            <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4">
                <p>Please select a month from the sidebar to view events.</p>
            </div>
        `;
    }

    // Set up month navigation
    document.querySelectorAll('.month-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const month = e.currentTarget.getAttribute('data-month');
            document.querySelectorAll('.month-nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            e.currentTarget.classList.add('active');
            renderMonthContent(month);
        });
    });

    // Set up modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('eventModal').style.display = 'none';
            document.getElementById('addEventModal').style.display = 'none';
        });
    });

    // Header buttons functionality
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            showToast('Filter functionality coming soon!');
        });
    }

    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            const currentMonth = document.querySelector('.month-nav-item.active').getAttribute('data-month');
            renderMonthContent(currentMonth);
            showToast('Events refreshed');
        });
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const currentMonth = document.querySelector('.month-nav-item.active').getAttribute('data-month');
            const events = eventsData.events.filter(event => {
                const eventMonth = parseInt(event.date.split('/')[0]) - 1;
                return monthNames[eventMonth].toLowerCase() === currentMonth;
            });

            const csvContent = 'data:text/csv;charset=utf-8,' + 
                'Date,Title,Characters,Details\n' +
                events.map(event => {
                    return `${event.date},"${event.title}","${event.characters.join(', ')}","${event.details}"`;
                }).join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `${currentMonth}_events.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(`Exported ${events.length} events to CSV`);
        });
    }

    // Add event button functionality
    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            document.getElementById('addEventModal').style.display = 'block';
        });
    }

    // Submit new event form
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('New event submission coming soon!');
            document.getElementById('addEventModal').style.display = 'none';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});