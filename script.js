// Teams in the league
const teams = [
    "GMT Warriors", 
    "Orbitax Prime", 
    "Fullstack FC", 
    "Shadow Strikers FC", 
    "Netsix and Kicks"
];

let matches = []; // {id, teamA, teamB, scoreA, scoreB}
let standings = {};

// Load data from localStorage if available
function loadData() {
    const savedMatches = localStorage.getItem("matches");
    if (savedMatches) {
        matches = JSON.parse(savedMatches);
    } else {
        matches = [];
    }
}

function saveData() {
    localStorage.setItem("matches", JSON.stringify(matches));
}

function resetData() {
    if (confirm("Are you sure you want to reset all data?")) {
        matches = [];
        saveData();
        updateTable();
        renderMatchesTable();
    }
}

// Initialize standings data
function initStandings() {
    standings = {};
    teams.forEach(team => {
        standings[team] = {
            team: team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0, // goals for
            ga: 0, // goals against
            gd: 0, // goal difference
            points: 0
        };
    });
}

// Calculate standings from matches
function calculateStandings() {
    initStandings();
    matches.forEach(match => {
        const {teamA, teamB, scoreA, scoreB} = match;
        // Update played
        standings[teamA].played += 1;
        standings[teamB].played += 1;

        // Update goals
        standings[teamA].gf += scoreA;
        standings[teamA].ga += scoreB;
        standings[teamB].gf += scoreB;
        standings[teamB].ga += scoreA;

        // Determine points
        if (scoreA > scoreB) {
            standings[teamA].won += 1;
            standings[teamA].points += 3;
            standings[teamB].lost += 1;
        } else if (scoreB > scoreA) {
            standings[teamB].won += 1;
            standings[teamB].points += 3;
            standings[teamA].lost += 1;
        } else {
            standings[teamA].drawn += 1;
            standings[teamB].drawn += 1;
            standings[teamA].points += 1;
            standings[teamB].points += 1;
        }
    });

    // Update GD for each team
    Object.values(standings).forEach(s => {
        s.gd = s.gf - s.ga;
    });
}

// Calculate head-to-head stats between two teams
function calcHeadToHead(teamX, teamY) {
    let tX = {points:0,gf:0,ga:0,gd:0};
    let tY = {points:0,gf:0,ga:0,gd:0};
    matches.forEach(m => {
        if ((m.teamA === teamX && m.teamB === teamY) ||
            (m.teamA === teamY && m.teamB === teamX)) {
            
            let xScore, yScore;
            if (m.teamA === teamX) {
                xScore = m.scoreA;
                yScore = m.scoreB;
            } else {
                xScore = m.scoreB;
                yScore = m.scoreA;
            }

            // Update goals
            tX.gf += xScore;
            tX.ga += yScore;
            tY.gf += yScore;
            tY.ga += xScore;

            // Update points
            if (xScore > yScore) {
                tX.points += 3;
            } else if (yScore > xScore) {
                tY.points += 3;
            } else {
                tX.points += 1;
                tY.points += 1;
            }
        }
    });
    tX.gd = tX.gf - tX.ga;
    tY.gd = tY.gf - tY.ga;
    return [tX, tY];
}

// Head-to-head tiebreaker
function headToHeadSort(a,b) {
    // Sort by points
    if (a.points !== b.points) return b.points - a.points;
    // Then GD
    if (a.gd !== b.gd) return b.gd - a.gd;
    // Then GF
    if (a.gf !== b.gf) return b.gf - a.gf;

    // Head-to-head:
    const [aRec, bRec] = calcHeadToHead(a.team, b.team);
    if (aRec.points !== bRec.points) return bRec.points - aRec.points;
    if (aRec.gd !== bRec.gd) return bRec.gd - aRec.gd;
    if (aRec.gf !== bRec.gf) return bRec.gf - aRec.gf;

    return 0; // if still tied, no change
}

function updateTable() {
    calculateStandings();
    let arr = Object.values(standings);
    arr.sort(headToHeadSort);

    const tbody = document.querySelector("#league-table tbody");
    tbody.innerHTML = "";
    arr.forEach((teamData, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index+1}</td>
            <td>${teamData.team}</td>
            <td>${teamData.played}</td>
            <td>${teamData.won}</td>
            <td>${teamData.drawn}</td>
            <td>${teamData.lost}</td>
            <td>${teamData.gf}</td>
            <td>${teamData.ga}</td>
            <td>${teamData.gd}</td>
            <td>${teamData.points}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderMatchesTable() {
    const tbody = document.querySelector("#matches-table tbody");
    tbody.innerHTML = "";
    matches.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${m.id}</td>
            <td>${m.teamA}</td>
            <td>${m.scoreA}</td>
            <td>${m.teamB}</td>
            <td>${m.scoreB}</td>
            <td><button onclick="editMatch(${m.id})">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function editMatch(id) {
    const match = matches.find(m => m.id === id);
    if (!match) return;
    document.getElementById('match-id').value = match.id;
    document.getElementById('teamA').value = match.teamA;
    document.getElementById('teamB').value = match.teamB;
    document.getElementById('scoreA').value = match.scoreA;
    document.getElementById('scoreB').value = match.scoreB;
}

document.getElementById("match-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const matchId = document.getElementById("match-id").value.trim();
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    const scoreA = parseInt(document.getElementById("scoreA").value);
    const scoreB = parseInt(document.getElementById("scoreB").value);

    if (!teamA || !teamB || teamA === teamB) {
        alert("Please select two different teams.");
        return;
    }

    let match;
    if (matchId) {
        // Edit existing
        match = matches.find(m => m.id == matchId);
        if (!match) {
            alert("No match found with given ID");
            return;
        }
        match.teamA = teamA;
        match.teamB = teamB;
        match.scoreA = scoreA;
        match.scoreB = scoreB;
    } else {
        // Add new
        const newId = matches.length > 0 ? Math.max(...matches.map(m=>m.id)) + 1 : 1;
        match = {
            id: newId,
            teamA: teamA,
            teamB: teamB,
            scoreA: scoreA,
            scoreB: scoreB
        };
        matches.push(match);
    }

    saveData();
    updateTable();
    renderMatchesTable();
    this.reset();
});

// Tab functionality
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab");
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove("active"));
        // Hide all tab contents
        tabContents.forEach(tab => tab.style.display = "none");
        // Show the selected tab
        document.getElementById(targetTab).style.display = "block";
        // Mark this button as active
        button.classList.add("active");
    });
});

// Menu toggle functionality
const menuButton = document.getElementById('menu-button');
const menuDropdown = document.getElementById('menu-dropdown');

menuButton.addEventListener('click', () => {
    menuDropdown.style.display = (menuDropdown.style.display === 'block') ? 'none' : 'block';
});

// Close the dropdown if user clicks outside
document.addEventListener('click', (e) => {
    if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.style.display = 'none';
    }
});

// **Add this line to ensure the reset button works:**
document.getElementById("reset-data").addEventListener("click", resetData);

// On page load
loadData();
updateTable();
renderMatchesTable();
