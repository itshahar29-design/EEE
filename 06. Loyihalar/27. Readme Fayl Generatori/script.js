
    window.genReadme = () => {
        const title = document.getElementById('rm-title').value || 'My Project';
        const desc = document.getElementById('rm-desc').value || 'Project description';
        const cmd = document.getElementById('rm-install').value || 'npm install && npm start';
        const res = `# ${title}\n\n${desc}\n\n## 🚀 O'rnatish va Ishga Tushirish\n\`\`\`bash\n${cmd}\n\`\`\`\n\n## 👨‍💻 Muallif\nFrontend Jamoasi`;
        document.getElementById('rm-result').value = res;
    };
  