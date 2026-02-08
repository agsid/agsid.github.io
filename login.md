---
layout: page
title: Team Dashboard
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        :root { --bg: #1e1e1e; --sidebar: #252526; --text: #cccccc; --active: #37373d; --blue: #007acc; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; display: flex; justify-content: center; padding-top: 60px; }
        .card { background: var(--sidebar); padding: 40px; border-radius: 2px; width: 450px; border: 1px solid #333; }
        h2, h4 { color: #fff; font-weight: 400; margin-top: 0; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #3c3c3c; background: #3c3c3c; color: white; border-radius: 2px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; margin: 5px 0; border: none; cursor: pointer; font-size: 0.9rem; }
        .btn-primary { background: var(--blue); color: white; }
        .btn-outline { background: #3c3c3c; color: white; }
        .file-item { padding: 10px; border-radius: 2px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; transition: 0.1s; }
        .file-item:hover { background: var(--active); }
        .team-id-badge { background: #000; color: #85e89d; padding: 4px 8px; font-family: monospace; font-size: 0.75rem; border-radius: 2px; }
    </style>
</head>
<body>
    <div class="card">
        <div id="no-team-view" style="display:none;">
            <h2>Team Selection</h2>
            <h4>Create New Team</h4>
            <input type="text" id="new-team-name" placeholder="Team Name">
            <button class="btn-primary" onclick="createTeam()">Create</button>
            <div style="margin: 20px 0; text-align: center; font-size: 0.8rem; color: #555;">OR</div>
            <h4>Join with ID</h4>
            <input type="text" id="join-team-id" placeholder="Paste UUID">
            <button class="btn-outline" onclick="joinTeam()">Join</button>
        </div>

        <div id="team-view" style="display:none;">
            <h2 id="display-team-name">--</h2>
            <p style="font-size: 0.8rem;">Team ID: <span class="team-id-badge" id="display-team-id"></span></p>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
            <h3>Projects</h3>
            <div id="file-list" style="margin-bottom: 20px;"></div>
            <input type="text" id="new-file-name" placeholder="new_mission.py">
            <button class="btn-primary" onclick="createFile()">Create File</button>
        </div>
    </div>
    <script>
        const SB_URL = 'https://wgy2n08b0i34.supabase.co';
        const SB_KEY = 'sb_publishable_WGy2N08B0i34_K84gtVDxw_5v4jm5NB';
        const supabase = window.supabase.createClient(SB_URL, SB_KEY);
        let currentUser = null;

        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = 'login.html'; return; }
            currentUser = user;
            const { data: membership } = await supabase.from('team_members').select('team_id, teams(name)').eq('user_id', user.id).single();
            if (membership) showTeamView(membership.team_id, membership.teams.name);
            else document.getElementById('no-team-view').style.display = 'block';
        }

        function showTeamView(teamId, teamName) {
            document.getElementById('no-team-view').style.display = 'none';
            document.getElementById('team-view').style.display = 'block';
            document.getElementById('display-team-name').innerText = teamName;
            document.getElementById('display-team-id').innerText = teamId;
            loadFiles(teamId);
        }

        async function loadFiles(teamId) {
            const { data: files } = await supabase.from('code_files').select('*').eq('team_id', teamId);
            document.getElementById('file-list').innerHTML = files.map(f => `
                <div class="file-item" onclick="window.location.href='index.html?fileId=${f.id}'">
                    <span style="color: #4ec9b0;">📄 ${f.filename}</span>
                    <small style="color: #666;">${new Date(f.updated_at).toLocaleDateString()}</small>
                </div>
            `).join('');
        }

        async function createTeam() {
            const name = document.getElementById('new-team-name').value;
            const { data: team } = await supabase.from('teams').insert([{ name }]).select().single();
            await supabase.from('team_members').insert([{ team_id: team.id, user_id: currentUser.id }]);
            location.reload();
        }

        async function joinTeam() {
            const teamId = document.getElementById('join-team-id').value;
            await supabase.from('team_members').insert([{ team_id: teamId, user_id: currentUser.id }]);
            location.reload();
        }

        async function createFile() {
            const name = document.getElementById('new-file-name').value;
            const teamId = document.getElementById('display-team-id').innerText;
            const { data } = await supabase.from('code_files').insert([{ team_id: teamId, filename: name, content: '' }]).select().single();
            window.location.href = `index.html?fileId=${data.id}`;
        }
        init();
    </script>
</body>
</html>