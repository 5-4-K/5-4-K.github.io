// Teams in the league
const teams = ["Team1", "Team2", "Team3", "Team4", "Team5"];

// Structure to hold match data and league standings
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

// Reset all data
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
    // First populate basic team stats
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
            // A wins
            standings[teamA].won += 1;
            standings[teamB].lost += 1;
            standings[teamA].points += 3;
        } else if (scoreB > scoreA) {
            // B wins
            standings[teamB].won += 1;
            standings[teamA].lost += 1;
            standings[teamB].points += 3;
        } else {
            // draw
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

    // After basic sorting, we need to handle head-to-head if still tied
    // Let's sort step-by-step
}

// Head-to-head tiebreaker
// We will generate a sorting function that checks ties on points, gd, gf and then h2h
function headToHeadSort(a,b) {
    // Sort by points
    if (a.points !== b.points) return b.points - a.points;
    // Then GD
    if (a.gd !== b.gd) return b.gd - a.gd;
    // Then GF
    if (a.gf !== b.gf) return b.gf - a.gf;

    // Head-to-head:
    // Extract matches where these two teams played each other
    const [aRec, bRec] = calcHeadToHead(a.team, b.team);
    // aRec and bRec are objects with points/gd/gf from their h2h matches
    if (aRec.points !== bRec.points) return bRec.points - aRec.points;
    if (aRec.gd !== bRec.gd) return bRec.gd - aRec.gd;
    if (aRec.gf !== bRec.gf) return bRec.gf - aRec.gf;

    return 0; // if still tied, just return 0
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

// Handle form submit
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

document.getElementById("reset-data").addEventListener("click", resetData);

// On page load
loadData();
updateTable();
renderMatchesTable();
