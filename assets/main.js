// assets/main.js - site behavior: theme toggle, nav toggle, cookie consent, form fallback
(function(){
  const root = document.documentElement;

  // Theme: apply stored preference or system preference
  const stored = localStorage.getItem('site-theme');
  if(stored) root.setAttribute('data-theme', stored);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme','dark');
  } else {
    root.setAttribute('data-theme','light');
  }

  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', cur);
      localStorage.setItem('site-theme', cur);
      themeToggle.setAttribute('aria-pressed', cur === 'dark');
    });
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navbar = document.querySelector('.navbar');
  if(navToggle && navbar){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navbar.classList.toggle('open');
    });
  }

  // Cookie / analytics consent (simple, local-only)
  const consentEl = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('accept-analytics');
  const declineBtn = document.getElementById('decline-analytics');
  const consentKey = 'site-analytics-consent';
  function hideConsent(){
    if(consentEl) { consentEl.style.display = 'none'; consentEl.setAttribute('aria-hidden','true'); }
  }
  function showConsent(){ if(consentEl){ consentEl.style.display = 'block'; consentEl.setAttribute('aria-hidden','false'); } }
  const storedConsent = localStorage.getItem(consentKey);
  if(storedConsent === null) showConsent(); else hideConsent();
  if(acceptBtn){ acceptBtn.addEventListener('click', ()=>{ localStorage.setItem(consentKey,'accepted'); hideConsent(); /* load analytics here if any */ }); }
  if(declineBtn){ declineBtn.addEventListener('click', ()=>{ localStorage.setItem(consentKey,'declined'); hideConsent(); }); }

  // Contact form fallback: if action is placeholder, do mailto fallback
  const form = document.querySelector('.contact-form');
  if(form){
    const action = form.getAttribute('action') || '';
    if(action.includes('your-form-id') || action.trim() === ''){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const name = (form.querySelector('[name=name]')||{}).value || '';
        const email = (form.querySelector('[name=email]')||{}).value || '';
        const message = (form.querySelector('[name=message]')||{}).value || '';
        const subject = encodeURIComponent('Website contact from '+name);
        const body = encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\n'+message);
        window.location.href = 'mailto:sibyabin@gmail.com?subject='+subject+'&body='+body;
      });
    }
  }

  // Small enhancement: reveal images with data-src (lazy load)
  const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
  if('IntersectionObserver' in window && lazyImages.length){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target; img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img=>io.observe(img));
  }

  // Fetch GitHub pinned projects
  async function fetchGitHubProjects(){
    const grid = document.getElementById('projects-grid');
    if(!grid) return;
    
    const targetRepos = ['dataform-sample', 'order-analytics', 'blogs', 'pg-dock-sql', 'k8s-tools', 'learning-k8s'];
    
    try {
      const response = await fetch('https://api.github.com/users/sibyabin/repos?per_page=100');
      if(!response.ok) throw new Error('GitHub API error');
      
      const allRepos = await response.json();
      const selectedRepos = targetRepos
        .map(name => allRepos.find(repo => repo.name === name))
        .filter(repo => repo); // Filter out undefined repos
      
      if(selectedRepos.length === 0) throw new Error('Repos not found');
      
      grid.innerHTML = selectedRepos.map(repo => `
        <a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener" aria-label="View ${repo.name} repository">
          <div class="project-header">
            <h3>${repo.name}</h3>
            ${repo.language ? `<span class="lang-badge">${repo.language}</span>` : ''}
          </div>
          <p class="project-desc">${repo.description || 'No description'}</p>
          <div class="project-footer">
            <span class="stars">⭐ ${repo.stargazers_count}</span>
            <span class="forks">🍴 ${repo.forks_count}</span>
          </div>
        </a>
      `).join('');
    } catch(err){
      console.warn('Could not fetch GitHub projects:', err);
      grid.innerHTML = `
        <a class="project-card" href="https://github.com/sibyabin" target="_blank" rel="noopener">
          <h3>View GitHub Profile</h3>
          <p>Explore all repositories and projects on GitHub</p>
        </a>
      `;
    }
  }

  // Fetch recent blogs from hardcoded list
  async function fetchBlogs(){
    const grid = document.getElementById('blogs-grid');
    if(!grid) return;

    // Hardcoded blog list (top 4 from blogs.sibyabin.tech)
    const blogs = [
      {
        title: 'Unlocking the power of cost-effective development for your hobby projects: Raspberry Pi 4',
        link: 'https://blogs.sibyabin.tech/dataengineering/development/raspberry/cost-effective-development-setup-your-hobby-projects/',
        date: 'June 17, 2023',
        excerpt: 'Are you passionate about turning your hobby projects into reality? The Raspberry Pi 4 is here to make your dreams come true without breaking the bank.'
      },
      {
        title: 'Hot skills in 2023 that will help you land your dream data engineering job',
        link: 'https://blogs.sibyabin.tech/dataengineering/tech/hot-skills-for-dataengineers-in-2023/',
        date: 'April 1, 2023',
        excerpt: 'Discusses key skills and technology used widely in the data engineering landscape. Your dream employment as a data engineer will be within reach with these skills.'
      },
      {
        title: 'How I passed the Databricks Certified Associate Developer for Apache Spark 3.0',
        link: 'https://blogs.sibyabin.tech/certification/databricks/associate-developer-spark/how-i-passed-databricks-certified-associate-developer-for-apachespark-certification/',
        date: 'August 10, 2022',
        excerpt: 'I passed the Databricks Certified Associate Developer for Apache Spark 3.0 certification. This blog lists out all the steps I followed to get certified as a spark developer.'
      },
      {
        title: 'Beginners guide to Apache Spark, a lightning-fast unified analytics engine',
        link: 'https://blogs.sibyabin.tech/learning/apache-spark/beginners-guide-to-apachespark-lightning-fast-unified-engine/',
        date: 'August 7, 2022',
        excerpt: 'Apache Spark is a lightning-fast unified analytics engine for big data and machine learning. This blog points you to good resources to learn spark from the fundamentals.'
      }
    ];

    try {
      grid.innerHTML = blogs.map(blog => `
        <a class="blog-card" href="${blog.link}" target="_blank" rel="noopener" aria-label="Read ${blog.title}">
          <h3>${blog.title}</h3>
          <p class="blog-meta">${blog.date}</p>
          <p class="blog-excerpt">${blog.excerpt}</p>
        </a>
      `).join('');
    } catch(err){
      console.warn('Could not render blogs:', err);
      grid.innerHTML = `
        <a class="blog-card" href="https://blogs.sibyabin.tech" target="_blank" rel="noopener">
          <h3>Visit My Blog</h3>
          <p class="blog-meta">Explore all articles</p>
          <p class="blog-excerpt">Check out my latest posts on data engineering, cloud platforms, and technical insights.</p>
        </a>
      `;
    }
  }
  
  // Fetch projects and blogs when DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      fetchGitHubProjects();
      fetchBlogs();
    });
  } else {
    fetchGitHubProjects();
    fetchBlogs();
  }

})();
