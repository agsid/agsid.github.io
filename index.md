---
layout: default
---

<section class="bg-gradient-to-r from-[#3A3982] to-[#4A47A9] text-white py-20 sm:py-32 text-center">
    <div class="container mx-auto px-4">
        <div class="flex justify-center mb-8">
            <img src="{{ '/1.svg' | relative_url }}" alt="Logo" class="max-w-xs sm:max-w-md">
        </div>
        <a href="#projects" class="bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition transform inline-block">View My Work</a>
    </div>
</section>

<section id="skills" class="py-16 sm:py-24">
    <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-12">My Core Skills</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div class="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg">
                <i class="devicon-html5-plain skill-icon text-gray-900"></i>
                <span class="text-lg font-semibold mt-2 text-gray-900">HTML5</span>
            </div>
            </div>
    </div>
</section>

<section id="projects" class="py-16 sm:py-24">
    <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-white mb-12">My Projects</h2>
        <div id="projects-container" class="grid grid-cols-1 md:grid-cols-3 gap-8">
            </div>
    </div>
</section>

<section id="contact" class="bg-white bg-opacity-10 text-white py-16 text-center">
    <h2 class="text-3xl font-bold mb-6">Let's Build Something Together</h2>
    <a href="mailto:{{ site.email }}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 inline-block">Email Me</a>
</section>