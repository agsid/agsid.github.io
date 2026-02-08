---
layout: page
title: Home
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FLL Robot Editor</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body { font-family: sans-serif; display: flex; height: 100vh; margin: 0; background: #212529; color: white; overflow: hidden; }
        .sidebar { width: 35%; background: white; color: #333; padding: 20px; display: flex; flex-direction: column; border-right: 2px solid #444; }
        .preview { width: 65%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        textarea { flex-grow: 1; font-family: monospace; padding: 15px; border-radius: 8px; border: 1px solid #ccc; margin: 10px 0; resize: none; }
        canvas { background: white; border: 5px solid #555; border-radius: 4px; }
        .btn-group { display: flex; gap: 5px; }
        button { flex: 1; padding: 10px; cursor: pointer; border-radius: 4px; border: none; font-weight: bold; }
        .btn-blue { background: #007bff; color: white; }
        .btn-gray { background: #6c757d; color: white; }
    </style>
</head>
<body>

    <div class="sidebar">
        <h2 style="margin-top:0">🤖 Editor</h2>
        <div class="btn-group">
            <button class="btn-gray" onclick="setStart('left')">Left Start</button>
            <button class="btn-gray" onclick="setStart('right')">Right Start</button>
        </div>
        
        <textarea id="code-editor" oninput="updatePreview()" placeholder="drive(20)"></textarea>
        
        <div class="btn-group">
            <button class="btn-blue" onclick="saveCode()">Save & Sync</button>
            <button class="btn-gray" onclick="exportPython()">Download .py</button>
        </div>
        <button onclick="logout()" style="margin-top:10px; background:none; color:red; text-decoration:underline;">Logout</button>
        <div id="status" style="color: green; margin-top:5px; font-size:0.8rem;"></div>
    </div>

    <div class="preview">
        <canvas id="fllMat" width="930" height="450"></canvas>
        <p style="color:#888; margin-top:10px;">FLL Mat: 93in x 45in</p>
    </div>

    <script>
        const SB_URL = 'https://wgy2n08b0i34.supabase.co';
        const SB_KEY = 'sb_publishable_WGy2N08B0i34_K84gtVDxw_5v4jm5NB';
        const supabase = window.supabase.createClient(SB_URL, SB_KEY);

        let currentUser = null;
        let currentTeamId = null;
        let currentFileId = null;
        let startSide = 'left';

        // Security Check: Redirect to login if not authenticated
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = 'login.html';
            } else {
                currentUser = user;
                initApp();
            }
        }

        async function initApp() {
            // Find team membership
            const { data: members } = await supabase.from('team_members').select('team_id').eq('user_id', currentUser.id).single();
            if (members) {
                currentTeamId = members.team_id;
                loadCode();
                setupRealtime();
            }
        }

        async function loadCode() {
            let { data: files } = await supabase.from('code_files').select('*').eq('team_id', currentTeamId).limit(1);
            if (files?.length) {
                currentFileId = files[0].id;
                document.getElementById('code-editor').value = files[0].content;
                updatePreview();
            }
        }

        async function saveCode() {
            const content = document.getElementById('code-editor').value;
            await supabase.from('code_files').update({ content, last_edited_by: currentUser.id }).eq('id', currentFileId);
            document.getElementById('status').innerText = "✓ Synced";
            setTimeout(() => document.getElementById('status').innerText = "", 2000);
        }

        function setupRealtime() {
            supabase.channel('sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'code_files', filter: `team_id=eq.${currentTeamId}` }, 
            (payload) => {
                if (payload.new.last_edited_by !== currentUser.id) {
                    document.getElementById('code-editor').value = payload.new.content;
                    updatePreview();
                }
            }).subscribe();
        }

        function setStart(side) { startSide = side; updatePreview(); }

        function updatePreview() {
            const code = document.getElementById('code-editor').value;
            const canvas = document.getElementById('fllMat');
            const ctx = canvas.getContext('2d');
            const SCALE = 10;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let x = startSide === 'left' ? 10 : 83;
            let y = 22.5; 
            let angle = startSide === 'left' ? 0 : 180;

            ctx.beginPath();
            ctx.moveTo(x * SCALE, y * SCALE);

            code.split('\n').forEach(line => {
                const drive = line.match(/drive\(\s*(-?\d+)\s*\)/);
                const turn = line.match(/turn\(\s*(-?\d+)\s*\)/);
                if (drive) {
                    const d = parseInt(drive[1]);
                    x += d * Math.cos(angle * Math.PI / 180);
                    y += d * Math.sin(angle * Math.PI / 180);
                    ctx.lineTo(x * SCALE, y * SCALE);
                }
                if (turn) angle += parseInt(turn[1]);
            });

            ctx.strokeStyle = (x<0 || x>93 || y<0 || y>45) ? 'red' : '#007bff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = ctx.strokeStyle === 'red' ? 'red' : 'green';
            ctx.beginPath(); ctx.arc(x * SCALE, y * SCALE, 8, 0, 7); ctx.fill();
        }

        async function logout() {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }

        function exportPython() {
            const userCode = document.getElementById('code-editor').value;
            const processed = userCode.split('\n').map(l => {
                const t = l.trim();
                return (t.startsWith('drive') || t.startsWith('turn') || t.includes('move')) ? `    await ${t}` : `    ${t}`;
            }).join('\n');
            const blob = new Blob([`import hub\n\nasync def runloop():\n${processed}\n\nrunloop()`], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "robot_code.py";
            a.click();
        }

        checkUser();
    </script>
</body>
</html>