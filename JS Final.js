let Event = class {
    constructor(name, time, date, location, notes) {
        this.name = name;
        this.time = time;
        this.date = date;
        this.location = location;
        this.notes = notes;
    }
}

const addBtn = document.getElementById('addBtn');
const listDiv = document.getElementById('listDiv');
const eventList = document.createElement('ul');
const viewWindow = document.getElementById('viewWindow');
const editWindow = document.getElementById('editWindow');
const mapDiv = document.getElementById('mapDiv');
const key = ''; // Needs a uniqie key from Openweather API//
var map = null;

loadEvent();

addBtn.addEventListener('click', () => {
    saveEvent();
    clearWindows();
    clearInputs();
    clearMapdiv();

});


function saveEvent() {
    let name = document.getElementById('name').value;
    if (!name) {
        alert('Please enter a event');
        return
    } else {
        let time = document.getElementById('time').value;
        let date = document.getElementById('date').value;
        let location = document.getElementById('location').value;
        let notes = document.getElementById('notes').value;
        let userEvent = new Event(name, time, date, location, notes);
        let uniqueId = new Date().getTime();
        localStorage.setItem(uniqueId, JSON.stringify(userEvent));

        shortList(uniqueId);
    }
}

function shortList(uniqueId) {
    let eventInfo = JSON.parse(localStorage.getItem(uniqueId));
    let listItem = document.createElement('li');
    let viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    let mapBtn = document.createElement('button');
    mapBtn.textContent = 'View on Map';
    let shareBtn = document.createElement('button');
    shareBtn.textContent = 'Share Via Mail';
    listItem.innerHTML = `${eventInfo.name}. `;
    listItem.appendChild(viewBtn);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    listItem.appendChild(mapBtn);
    listItem.appendChild(shareBtn);
    eventList.appendChild(listItem);
    listDiv.appendChild(eventList);

    viewBtn.addEventListener('click', () => viewEvent(eventInfo));
    editBtn.addEventListener('click', () => editEvent(eventInfo, listItem, uniqueId, viewBtn, editBtn, deleteBtn, mapBtn, shareBtn));
    deleteBtn.addEventListener('click', () => deleteEvent(uniqueId, listItem));
    mapBtn.addEventListener('click', () => viewMap(eventInfo));
    shareBtn.addEventListener('click', shareEvent(eventInfo));
}
function viewEvent(eventInfo) {
    clearWindows();
    clearMapdiv();
    viewWindow.innerHTML = `Name: ${eventInfo.name}<br /> Time: ${eventInfo.time}<br /> Date:${eventInfo.date}<br /> Location: ${eventInfo.location}<br /> Notes: ${eventInfo.notes}<br />`;
    let closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    viewWindow.appendChild(closeBtn);
    closeBtn.addEventListener('click', () => {
        viewWindow.innerHTML = '';
    });
}

function editEvent(eventInfo, listItem, uniqueId, viewBtn, editBtn, deleteBtn, mapBtn, shareBtn) {
    clearWindows();
    clearMapdiv();
    let newNameLabel = document.createElement('label');
    newNameLabel.textContent = `Event Name:`;
    let newName = document.createElement('input');
    newName.value = eventInfo.name;

    let newTimeLabel = document.createElement('label');
    newTimeLabel.textContent = ` Event Time:`;
    let newTime = document.createElement('input');
    newTime.type = 'time';
    newTime.value = eventInfo.time;

    let newDateLabel = document.createElement('label');
    newDateLabel.textContent = ` Event Date: `;
    let newDate = document.createElement('input');
    newDate.type = 'date';
    newDate.value = eventInfo.date;

    let newLocationLabel = document.createElement('label');
    newLocationLabel.textContent = ` Event Location:`;
    let newLocation = document.createElement('input');
    newLocation.value = eventInfo.location;

    let newNotesLabel = document.createElement('label');
    newNotesLabel.textContent = ` Event Notes:`;
    let newNotes = document.createElement('input');
    newNotes.value = eventInfo.notes;

    let saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
        eventInfo.name = newName.value;
        eventInfo.time = newTime.value;
        eventInfo.date = newDate.value;
        eventInfo.location = newLocation.value;
        eventInfo.notes = newNotes.value;
        localStorage.setItem(uniqueId, JSON.stringify(eventInfo));
        clearWindows();
        listItem.innerHTML = `${eventInfo.name} `;
        listItem.appendChild(viewBtn);
        listItem.appendChild(editBtn);
        listItem.appendChild(deleteBtn);
        listItem.appendChild(mapBtn);
        listItem.appendChild(shareBtn);
    });
    editWindow.appendChild(newNameLabel);
    editWindow.appendChild(newName);
    editWindow.appendChild(newTimeLabel);
    editWindow.appendChild(newTime);
    editWindow.appendChild(newDateLabel);
    editWindow.appendChild(newDate);
    editWindow.appendChild(newLocationLabel);
    editWindow.appendChild(newLocation);
    editWindow.appendChild(newNotesLabel);
    editWindow.appendChild(newNotes);
    editWindow.appendChild(saveBtn);

}

function deleteEvent(uniqueId, listItem) {
    clearWindows();
    clearMapdiv();
    localStorage.removeItem(uniqueId);
    eventList.removeChild(listItem);
}

function loadEvent() {
    eventList.innerHTML = '';
    for (i = 0; i < localStorage.length; i++) {
        let uniqueId = localStorage.key(i);
        shortList(uniqueId);
    }

}

function clearWindows() {
    viewWindow.innerHTML = '';
    editWindow.innerHTML = '';
}

function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('time').value = '';
    document.getElementById('date').value = '';
    document.getElementById('location').value = '';
    document.getElementById('notes').value = '';
}

function viewMap(eventInfo) {
    clearWindows();
    clearMapdiv();
    if (map) {
        map.remove();
    }
    mapDiv.style.display = 'block';

    map = L.map('mapDiv').setView([0, 0], 1)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${eventInfo.location}&limit=5&appid=${key}`)
        .then(response => response.json())
        .then(data => {
            let lat = data[0].lat;
            let lon = data[0].lon;
            var marker = L.marker([lat, lon], 12).addTo(map);
            marker.bindPopup(`Event Name: ${eventInfo.name}`).openPopup();
            map.setView([lat, lon], 12);
        })
        .catch(err => {
            alert('Error: Location not found!');
            console.log(err);
            clearMapdiv();
        });

    let mapClose = document.createElement('button');
    mapClose.textContent = 'Close Map';
    mapClose.id = 'mapClose';
    document.body.appendChild(mapClose);
    mapClose.addEventListener('click', () => {
        clearMapdiv();
        mapClose.remove();
    });
}

function clearMapdiv() {
    if (map) {
        map.remove();
        map = null;
        mapDiv.style.display = 'none';
        document.getElementById('mapClose').remove();
    };
}

function shareEvent(eventInfo) {
    return () => { // Return a function to be used as an event handler
        const subject = encodeURIComponent(`Event: ${eventInfo.name}`);
        const body = encodeURIComponent(
            `Here are the details for the event:\n\n` +
            `Name: ${eventInfo.name}\n` +
            `Time: ${eventInfo.time}\n` +
            `Date: ${eventInfo.date}\n` +
            `Location: ${eventInfo.location}\n` +
            `Notes: ${eventInfo.notes}\n\n` +
            `Regards,\nEvent Organizer`
        );
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
    };
}
