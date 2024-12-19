// Teams and players
const teams = [
    "GMT Warriors", 
    "Orbitax Prime", 
    "Fullstack FC", 
    "Shadow Strikers FC", 
    "Netsix and Kicks"
];

const teamPlayers = {
    "GMT Warriors": [
        "Ashap Bappy",
        "Kamruzzaman",
        "Shafi",
        "Habibullah",
        "Shibli",
        "Fayzul",
        "Razib",
        "Meraj (BIRT)"
    ],
    "Orbitax Prime": [
        "Nazmus Sakib",
        "Farhan",
        "Mahi",
        "Miraz (QA)",
        "Ishtiaq",
        "Masud Rana",
        "Nabil",
        "Mestu"
    ],
    "Fullstack FC": [
        "Mozahidul",
        "Zubran",
        "Amdadul",
        "Nobel",
        "Mridha",
        "Masum Billah",
        "Fahim BIRT",
        "Ebrahim Sazin"
    ],
    "Shadow Strikers FC": [
        "Plabon Biswas",
        "Foysal",
        "Shanto",
        "Shohan",
        "Kamrul",
        "Rakib",
        "Nasir"
    ],
    "Netsix and Kicks": [
        "Al Masum",
        "Swaad",
        "Jamil Zakaria",
        "Ashiqul Shakil",
        "Ahnaf BIRT",
        "Najmul BIRT",
        "Samiul"
    ]
};

let matches = [];
let standings = {};

// Load and save via API
async function loadData() {
    const res = await fetch('/api/matches');
    if (res.ok) {
        matches = await res.json();
    } else {
        matches = [];
    }
}

async function saveData() {
    await fetch('/api/matches', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(matches)
    });
}

async function resetData() {
    if (confirm("Are you sure you want to reset all data?")) {
        matches = [];
        await saveData();
        updateTable();
        renderMatchesTable();
        updatePlayerStatsTable();
    }
}

function initStandings() {
    standings = {};
    teams.forEach(team => {
        standings[team] = {
            team: team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            points: 0
        };
    });
}

function calculateStandings() {
    initStandings();
    matches.forEach(match => {
        const {teamA, teamB, teamAGoals, teamBGoals} = match;
        const scoreA = teamAGoals.length;
        const scoreB = teamBGoals.length;

        standings[teamA].played += 1;
        standings[teamB].played += 1;
        standings[teamA].gf += scoreA;
        standings[teamA].ga += scoreB;
        standings[teamB].gf += scoreB;
        standings[teamB].ga += scoreA;

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
    Object.values(standings).forEach(s => {
        s.gd = s.gf - s.ga;
    });
}

function calcHeadToHead(teamX, teamY) {
    let tX = {points:0,gf:0,ga:0,gd:0};
    let tY = {points:0,gf:0,ga:0,gd:0};
    matches.forEach(m => {
        if ((m.teamA === teamX && m.teamB === teamY) ||
            (m.teamA === teamY && m.teamB === teamX)) {
            
            let scoreA = m.teamAGoals.length;
            let scoreB = m.teamBGoals.length;
            let xScore, yScore;
            if (m.teamA === teamX) {
                xScore = scoreA;
                yScore = scoreB;
            } else {
                xScore = scoreB;
                yScore = scoreA;
            }

            tX.gf += xScore;
            tX.ga += yScore;
            tY.gf += yScore;
            tY.ga += xScore;

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

function headToHeadSort(a,b) {
    if (a.points !== b.points) return b.points - a.points;
    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;

    const [aRec, bRec] = calcHeadToHead(a.team, b.team);
    if (aRec.points !== bRec.points) return bRec.points - aRec.points;
    if (aRec.gd !== bRec.gd) return bRec.gd - aRec.gd;
    if (aRec.gf !== bRec.gf) return bRec.gf - aRec.gf;

    return 0;
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

function calculatePlayerStats() {
    let playerStats = {};
    for (let t of teams) {
        for (let p of teamPlayers[t]) {
            playerStats[p] = {
                team: t,
                matches: 0,
                goals: 0,
                assists: 0
            };
        }
    }

    matches.forEach(m => {
        const { teamA, teamB, teamAGoals, teamBGoals } = m;
        teamPlayers[teamA].forEach(p => playerStats[p].matches += 1);
        teamPlayers[teamB].forEach(p => playerStats[p].matches += 1);

        teamAGoals.forEach(g => {
            if (playerStats[g.scorer]) playerStats[g.scorer].goals += 1;
            if (playerStats[g.assist]) playerStats[g.assist].assists += 1;
        });
        teamBGoals.forEach(g => {
            if (playerStats[g.scorer]) playerStats[g.scorer].goals += 1;
            if (playerStats[g.assist]) playerStats[g.assist].assists += 1;
        });
    });

    return playerStats;
}

function updatePlayerStatsTable() {
    const playerStats = calculatePlayerStats();
    const playersArr = Object.keys(playerStats).map(playerName => {
        return {
            player: playerName,
            team: playerStats[playerName].team,
            matches: playerStats[playerName].matches,
            goals: playerStats[playerName].goals,
            assists: playerStats[playerName].assists
        };
    });

    const sortSelect = document.getElementById('player-stats-sort');
    const sortValue = sortSelect.value;

    playersArr.sort((a, b) => {
        if (sortValue === 'name') {
            return a.player.localeCompare(b.player);
        } else if (sortValue === 'team') {
            const teamCompare = a.team.localeCompare(b.team);
            if (teamCompare !== 0) return teamCompare;
            return a.player.localeCompare(b.player);
        } else if (sortValue === 'goals') {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.player.localeCompare(b.player);
        } else if (sortValue === 'assists') {
            if (b.assists !== a.assists) return b.assists - a.assists;
            if (b.goals !== a.goals) return b.goals - a.goals;
            return a.player.localeCompare(b.player);
        }
        return 0;
    });

    const tbody = document.querySelector("#players-table tbody");
    tbody.innerHTML = "";
    playersArr.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.player}</td>
            <td>${p.team}</td>
            <td>${p.matches}</td>
            <td>${p.goals}</td>
            <td>${p.assists}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderMatchesTable() {
    const tbody = document.querySelector("#matches-table tbody");
    tbody.innerHTML = "";
    matches.forEach(m => {
        const scoreA = m.teamAGoals.length;
        const scoreB = m.teamBGoals.length;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${m.id}</td>
            <td>${m.teamA}</td>
            <td>${scoreA}</td>
            <td>${m.teamB}</td>
            <td>${scoreB}</td>
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
    loadTeamPlayers('teamA', match.teamA);
    loadTeamPlayers('teamB', match.teamB);

    document.getElementById('teamA-goals-container').innerHTML = '';
    document.getElementById('teamB-goals-container').innerHTML = '';

    match.teamAGoals.forEach(g => addGoalRow('teamA-goals-container', 'A', g.scorer, g.assist));
    match.teamBGoals.forEach(g => addGoalRow('teamB-goals-container', 'B', g.scorer, g.assist));
}

function loadTeamPlayers(teamSelectId, teamName) {
    const teamSelect = document.getElementById(teamSelectId);
    if (!teamName) teamName = teamSelect.value;
    const containerId = (teamSelectId === 'teamA') ? 'teamA-goals-container' : 'teamB-goals-container';
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.goal-row');
    rows.forEach(row => {
        const scorerSelect = row.querySelector('.goal-scorer');
        const assistSelect = row.querySelector('.goal-assist');
        populatePlayerSelect(scorerSelect, teamName);
        populatePlayerSelect(assistSelect, teamName);
    });
}

function populatePlayerSelect(selectElem, teamName) {
    const players = teamPlayers[teamName] || [];
    const currentValue = selectElem.value;
    selectElem.innerHTML = '';

    // If this is an assist dropdown, first add the "No Assist" option
    if (selectElem.classList.contains('goal-assist')) {
        const noneOption = document.createElement('option');
        noneOption.value = '';
        noneOption.textContent = '(No Assist)';
        selectElem.appendChild(noneOption);
    }

    players.forEach(player => {
        const opt = document.createElement('option');
        opt.value = player;
        opt.textContent = player;
        selectElem.appendChild(opt);
    });

    if (players.includes(currentValue) || currentValue === '') {
        selectElem.value = currentValue;
    } else {
        // If previous value isn't valid anymore, fallback to no assist or first player
        if (selectElem.classList.contains('goal-assist')) {
            selectElem.value = ''; // no assist
        } else if (players.length > 0) {
            selectElem.value = players[0];
        }
    }
}


function addGoalRow(containerId, teamLetter, scorerVal = null, assistVal = null) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.classList.add('goal-row');

    // Scorer field
    const scorerField = document.createElement('div');
    scorerField.classList.add('goal-field');
    const scorerLabel = document.createElement('label');
    scorerLabel.textContent = 'Goal Scorer:';
    const scorerSelect = document.createElement('select');
    scorerSelect.classList.add('goal-scorer');
    scorerField.appendChild(scorerLabel);
    scorerField.appendChild(scorerSelect);

    // Assist field
    const assistField = document.createElement('div');
    assistField.classList.add('goal-field');
    const assistLabel = document.createElement('label');
    assistLabel.textContent = 'Assist:';
    const assistSelect = document.createElement('select');
    assistSelect.classList.add('goal-assist');
    assistField.appendChild(assistLabel);
    assistField.appendChild(assistSelect);

    // Remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.style.marginTop = '33px';
    removeButton.addEventListener('click', () => {
        container.removeChild(row);
    });

    row.appendChild(scorerField);
    row.appendChild(assistField);
    row.appendChild(removeButton);
    container.appendChild(row);

    const teamSelectId = (teamLetter === 'A') ? 'teamA' : 'teamB';
    const teamName = document.getElementById(teamSelectId).value;

    // Populate the selects
    populatePlayerSelect(scorerSelect, teamName);

    // For assists, first add an empty option to represent no assist
    assistSelect.innerHTML = '';
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = '(No Assist)';
    assistSelect.appendChild(noneOption);

    // Populate the rest of the players for assist
    const players = teamPlayers[teamName] || [];
    players.forEach(player => {
        const opt = document.createElement('option');
        opt.value = player;
        opt.textContent = player;
        assistSelect.appendChild(opt);
    });

    // If predefined values are provided
    if (scorerVal && players.includes(scorerVal)) scorerSelect.value = scorerVal;
    if (assistVal && players.includes(assistVal)) assistSelect.value = assistVal;
}


// Event listeners
document.getElementById('teamA').addEventListener('change', () => loadTeamPlayers('teamA'));
document.getElementById('teamB').addEventListener('change', () => loadTeamPlayers('teamB'));
document.getElementById('add-goal-teamA').addEventListener('click', () => addGoalRow('teamA-goals-container', 'A'));
document.getElementById('add-goal-teamB').addEventListener('click', () => addGoalRow('teamB-goals-container', 'B'));

document.getElementById("match-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const matchId = document.getElementById("match-id").value.trim();
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;

    if (!teamA || !teamB || teamA === teamB) {
        alert("Please select two different teams.");
        return;
    }

    const teamAGoals = [];
    document.querySelectorAll('#teamA-goals-container .goal-row').forEach(row => {
        const scorer = row.querySelector('.goal-scorer').value;
        const assist = row.querySelector('.goal-assist').value;
        teamAGoals.push({scorer, assist});
    });

    const teamBGoals = [];
    document.querySelectorAll('#teamB-goals-container .goal-row').forEach(row => {
        const scorer = row.querySelector('.goal-scorer').value;
        const assist = row.querySelector('.goal-assist').value;
        teamBGoals.push({scorer, assist});
    });

    let match;
    if (matchId) {
        match = matches.find(m => m.id == matchId);
        if (!match) {
            alert("No match found with given ID");
            return;
        }
        match.teamA = teamA;
        match.teamB = teamB;
        match.teamAGoals = teamAGoals;
        match.teamBGoals = teamBGoals;
    } else {
        const newId = matches.length > 0 ? Math.max(...matches.map(m=>m.id)) + 1 : 1;
        match = { id: newId, teamA, teamB, teamAGoals, teamBGoals };
        matches.push(match);
    }

    await saveData();
    updateTable();
    renderMatchesTable();
    updatePlayerStatsTable();
    this.reset();
    document.getElementById('teamA-goals-container').innerHTML = '';
    document.getElementById('teamB-goals-container').innerHTML = '';
});

document.getElementById("reset-data").addEventListener("click", resetData);
document.getElementById('player-stats-sort').addEventListener('change', updatePlayerStatsTable);

// Tab functionality
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab");
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(tab => tab.style.display = "none");
        document.getElementById(targetTab).style.display = "block";
        button.classList.add("active");
    });
});

// Menu toggle functionality
const menuButton = document.getElementById('menu-button');
const menuDropdown = document.getElementById('menu-dropdown');
menuButton.addEventListener('click', () => {
    menuDropdown.style.display = (menuDropdown.style.display === 'block') ? 'none' : 'block';
});
document.addEventListener('click', (e) => {
    if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.style.display = 'none';
    }
});

// On page load
(async function init() {
    await loadData();
    updateTable();
    renderMatchesTable();
    updatePlayerStatsTable();
})();
