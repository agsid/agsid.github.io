document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

  content.innerHTML = `
    <section id="overview">
      <h2 class="text-4xl font-bold text-blue-600 mb-4">Overview</h2>
      <p class="text-gray-700 leading-relaxed">
        Allied Work is a next-generation editor that lets LEGO Spike teams visualize and plan their robot’s movements 
        before testing. It provides precision, simulation, and automation — empowering your team to focus on innovation.
      </p>
    </section>

    <section id="autocorrection">
      <h2 class="text-4xl font-bold text-blue-600 mb-4">AutoCorrection (AACWork)</h2>
      <p class="text-gray-700 leading-relaxed">
        The AutoCorrection engine (AACWork) intelligently fine-tunes your robot's movements, 
        adjusting turns and distances to ensure consistent precision. 
        This reduces setup time and eliminates repetitive calibration.
      </p>
    </section>

    <section id="benefits">
      <h2 class="text-4xl font-bold text-blue-600 mb-4">Benefits</h2>
      <ul class="list-disc pl-6 text-gray-700 space-y-2">
        <li>Visualize robot motion in a real-world scale.</li>
        <li>Reduce trial-and-error through simulation.</li>
        <li>Collaborate with your team using a shared editor.</li>
        <li>Code and test faster with live path previews.</li>
      </ul>
    </section>

    <section id="commands">
      <h2 class="text-4xl font-extrabold text-blue-600 mb-6">Commands</h2>
      <p class="text-gray-700 mb-8">
        Use these built-in commands in Allied Work to control robot movement, speed, and mechanisms efficiently.
      </p>
      <div class="grid md:grid-cols-2 gap-8">
        ${cmd("drive","Moves the robot forward or backward by a set distance (in inches).","drive(24)")}
        ${cmd("turn","Rotates the robot by a given angle in degrees.","turn(90)")}
        ${cmd("speed","Sets the robot’s movement speed (0–100).","speed(80)")}
        ${cmd("wait","Pauses movement for a specified number of seconds.","wait(2)")}
        ${cmd("arm_speed","Controls the speed of the robot’s arm motor.","arm_speed(60)")}
        ${cmd("arm","Moves the arm up or down by a specific degree value.","arm(-45)")}
      </div>
    </section>`;
});

function cmd(name,desc,example){
  return `<div class="p-6 rounded-2xl bg-white/40 backdrop-blur-md shadow-md border border-white/40">
      <h3 class="text-2xl font-semibold text-blue-600 mb-2">${name}</h3>
      <p class="text-gray-700">${desc}</p>
      <code class="block bg-white/70 mt-3 px-3 py-1 rounded-md text-sm text-gray-800">${example}</code>
    </div>`;
}
