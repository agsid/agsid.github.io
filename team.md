---
layout: page
title: Team Dashboard
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Robot Studio - Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        :root { 
            --bg: #1e1e1e; 
            --sidebar: #252526; 
            --text: #cccccc; 
            --active: #37373d; 
            --blue: #007acc; 
            --border: #333333;
            --input: #3c3c3c;
        }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            padding-top: 40px; 
        }
        .container { width: 500px; }
        
        /* VS Code Style Card */
        .card { 
            background: var(--sidebar); 
            padding: 30px; 
            border: 1px solid var(--border); 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        h1, h2, h3 { color: #ffffff; font-weight: 300; margin-top: 0; }
        p { font-size: 0.9rem; color: #858585; }

        /* Inputs & Buttons */
        input { 
            width: 100%; padding: 10px; margin: 10px 0; 
            background: var(--input); border: 1px solid var(--border); 
            color: #fff; border-radius: 2px; box-sizing: border-box; 
        }
        input:focus { outline: 1px solid var(--blue); }
        
        button { 
            width: 100%; padding: 10px; margin: 5px 0; 
            border: none; cursor: pointer; font-size: 0.9rem; transition: 0.2s; 
        }
        .btn-primary { background: var(--blue); color: white; }
        .btn-primary:hover { background: #0062a3; }
        .btn-secondary { background: #3a3d41; color: white; }
        .btn-secondary:hover { background: #45494e; }

        /* File List Styles */
        .file-list { margin: 20px 0; border-top: 1px solid var(--border); }
        .file-item { 
            padding: 12px; border-bottom: 1px solid var(--border); 
            cursor: pointer; display: flex; align-items: center; gap: 10px;
        }
        .file-item:hover { background: var(--active); }
        .file-icon { color: #4ec9b0; } /* VS Code Greenish color for files */
        
        /* Team ID Badge */
        .badge { 
            background: #000; color: #85e89d; padding: 4px 8px; 
            font-family: 'Consolas', monospace; font-size: 0.75rem; 
            border-radius: 2px; display: inline-block; margin-top: 5px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div style="margin-bottom: 30px; text-align: center;">
            <h1 style="font-size: 2.5rem; letter-spacing: -1px;">Robot Studio</h1>
            <p>Select a mission or manage your team</p>
        </div>

        <div id="no-team-view" class="card" style="display:none;">
            <h2>Getting Started</h2>
            <p>You need to be part of a team to start coding.</p>
            
            <div style="margin-top:20px;">
                <h3 style="font-size: 1rem;">Create New Team</h3>
                <input type="text" id="new-team-name" placeholder="e.g., Master Builders">
                <button class="btn-primary" onclick="createTeam()">Create Team</button>
            </div>

            <div style="margin-top:20px; border-top: 1px solid var(--border); padding-top: 20px;">
                <h3 style="font-size: 1rem;">Join Existing Team</h3>
                <input type="text" id="join-team-id" placeholder="Paste Team ID (UUID)">
                <button class="btn-secondary" onclick="joinTeam()">Join Team</button>
            </div>
        </div>

        <div id="team-view" class="card" style="display:none;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h2 id="display-team-name" style="margin-bottom:5px;">Team Name</h2>
                    <p style="margin:0;">Team ID (Share this):</p>
                    <span class="badge" id="display-team-id">--</span>
                </div>
                <button class="btn-secondary" onclick="logout()" style="width: auto; font-size: 0.7rem;">Logout</button>
            </div>

            <div class="file-list" id="file-list">
                </div>

            <div style="margin-top: 20px;">
                <h3 style="font-size: 1rem;">Create New Mission</h3>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="new-file-name" placeholder="mission_1.py" style="margin:0;">
                    <button class="btn-primary" onclick="createFile()" style="width: auto; padding: 0 20px;">Create</button>
                </div>
            </div>
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

            // Check if user has a team
            const { data: membership, error } = await supabase
                .from('team_members')
                .select('team_id, teams(name)')
                .eq('user_id', currentUser.id)
                .maybeSingle();

            if (membership) {
                showTeamView(membership.team_id, membership.teams.name);
            } else {
                document.getElementById('no-team-view').style.display = 'block';
            }
        }

        function showTeamView(teamId, teamName) {
            document.getElementById('no-team-view').style.display = 'none';
            document.getElementById('team-view').style.display = 'block';
            document.getElementById('display-team-name').innerText = teamName;
            document.getElementById('display-team-id').innerText = teamId;
            loadFiles(teamId);
        }

        async function loadFiles(teamId) {
            const { data: files } = await supabase
                .from('code_files')
                .select('*')
                .eq('team_id', teamId)
                .order('updated_at', { ascending: false });

            const list = document.getElementById('file-list');
            if (files.length === 0) {
                list.innerHTML = '<p style="text-align:center; padding: 20px;">No files yet. Create one below!</p>';
                return;
            }

            list.innerHTML = files.map(f => `
                <div class="file-item" onclick="window.location.href='index.html?fileId=${f.id}'">
                    <span class="file-icon">PY</span>
                    <div style="flex-grow:1;">
                        <div style="color:#fff; font-size: 0.9rem;">${f.filename}</div>
                        <div style="font-size: 0.7rem; color: #666;">Edited ${new Date(f.updated_at).toLocaleDateString()}</div>
                    </div>
                    <span style="color: #444;">&gt;</span>
                </div>
            `).join('');
        }

        async function createTeam() {
            const name = document.getElementById('new-team-name').value;
            if (!name) return;
            const { data: team } = await supabase.from('teams').insert([{ name }]).select().single();
            await supabase.from('team_members').insert([{ team_id: team.id, user_id: currentUser.id }]);
            location.reload();
        }

        async function joinTeam() {
            const teamId = document.getElementById('join-team-id').value;
            if (!teamId) return;
            const { error } = await supabase.from('team_members').insert([{ team_id: teamId, user_id: currentUser.id }]);
            if (error) alert("Could not join team. Check the ID.");
            else location.reload();
        }

        async function createFile() {
            const name = document.getElementById('new-file-name').value;
            const teamId = document.getElementById('display-team-id').innerText;
            if (!name) return;

            const { data, error } = await supabase
                .from('code_files')
                .insert([{ team_id: teamId, filename: name, content: '# New Mission\n\ndrive(10)\nturn(90)' }])
                .select().single();
            
            if (data) window.location.href = `index.html?fileId=${data.id}`;
        }

        async function logout() {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }

        init();
    </script>
</body>
</html>