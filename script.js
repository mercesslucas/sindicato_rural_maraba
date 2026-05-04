document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initQuotes();
});

// Mobile Menu Logic
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');
    const icon = btn.querySelector('i');

    btn.addEventListener('click', () => {
        nav.classList.toggle('active');
        
        if (nav.classList.contains('active')) {
            icon.classList.remove('ph-list');
            icon.classList.add('ph-x');
        } else {
            icon.classList.remove('ph-x');
            icon.classList.add('ph-list');
        }
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            icon.classList.remove('ph-x');
            icon.classList.add('ph-list');
        });
    });
}

// Dynamic Quotes Logic
function initQuotes() {
    // Buscar cotações reais ao iniciar
    fetchBoiGordo();
    fetchSoja();
}

async function fetchBoiGordo() {
    try {
        const url = 'https://www.noticiasagricolas.com.br/cotacoes/boi-gordo';
        // Trocando allorigins por codetabs para evitar bloqueios de segurança do site origem
        const response = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url));
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Encontra a linha específica para "PA Marabá"
        const tds = doc.querySelectorAll('td');
        let marabaTd = null;
        for (let td of tds) {
            if (td.textContent.trim() === 'PA Marabá') {
                marabaTd = td;
                break;
            }
        }
        
        if (marabaTd) {
            const tr = marabaTd.parentElement;
            const columns = tr.querySelectorAll('td');
            if (columns.length >= 2) {
                const aVistaStr = columns[1].textContent.trim(); // Ex: "346,00"
                
                const priceEl = document.getElementById('boi-price');
                const trendEl = document.getElementById('boi-trend');
                
                if (priceEl && trendEl) {
                    priceEl.style.opacity = 0.5;
                    setTimeout(() => {
                        priceEl.textContent = aVistaStr;
                        trendEl.className = 'quote-trend trend-up';
                        trendEl.innerHTML = '<i class="ph ph-check-circle"></i> Atualizado agora';
                        priceEl.style.opacity = 1;
                    }, 300);
                }
            }
        } else {
            throw new Error("Tabela de Marabá não encontrada");
        }
    } catch (error) {
        console.error("Erro ao carregar cotação do boi gordo:", error);
        // Fallback em caso de bloqueio do proxy, para que o site nunca pareça quebrado
        document.getElementById('boi-price').textContent = "346,00";
        const trend = document.getElementById('boi-trend');
        trend.className = 'quote-trend trend-up';
        trend.innerHTML = '<i class="ph ph-warning"></i> Valor de referência';
    }
}

async function fetchSoja() {
    try {
        const url = 'https://www.noticiasagricolas.com.br/cotacoes/soja';
        const response = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url));
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Pega a primeira tabela de cotações (Geralmente o Indicador principal da Soja)
        const table = doc.querySelector('.cot-fisicas');
        if (table) {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                const firstRow = tbody.querySelector('tr');
                const columns = firstRow.querySelectorAll('td');
                if (columns.length >= 3) {
                    const precoStr = columns[1].textContent.trim(); // "127,43"
                    const variacaoStr = columns[2].textContent.trim(); // "+1,19"
                    
                    const priceEl = document.getElementById('soja-price');
                    const trendEl = document.getElementById('soja-trend');
                    
                    if (priceEl && trendEl) {
                        priceEl.style.opacity = 0.5;
                        setTimeout(() => {
                            priceEl.textContent = precoStr;
                            
                            const isDown = variacaoStr.includes('-');
                            let trendClass = 'trend-up';
                            let iconClass = 'ph-trend-up';
                            
                            if (isDown) {
                                trendClass = 'trend-down';
                                iconClass = 'ph-trend-down';
                            }
                            
                            trendEl.className = `quote-trend ${trendClass}`;
                            trendEl.innerHTML = `<i class="ph ${iconClass}"></i> ${variacaoStr}%`;
                            
                            priceEl.style.opacity = 1;
                        }, 300);
                    }
                }
            }
        } else {
            throw new Error("Tabela de soja não encontrada");
        }
    } catch (error) {
        console.error("Erro ao carregar cotação da soja:", error);
        // Fallback
        document.getElementById('soja-price').textContent = "127,43";
        const trend = document.getElementById('soja-trend');
        trend.className = 'quote-trend trend-up';
        trend.innerHTML = '<i class="ph ph-warning"></i> Valor de referência';
    }
}

