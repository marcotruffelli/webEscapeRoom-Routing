const $content = $('.terminal-content');
let history = [];
let historyIndex = -1;
const gameState = {
    minigame1: {
        completed: false,
        hintsUsed: 0,
    },
    minigame2: {
        completed: false,
        hintsUsed: 0,
    },
    minigame3: {
        completed: false,
        hintsUsed: 0,
    }
};

function totHintUsed() {
    return gameState.minigame1.hintsUsed + gameState.minigame2.hintsUsed + gameState.minigame3.hintsUsed;
}

//Gestione del login tramite mouse
const btnInizio = $('#submit-btn');
var i = 0;
btnInizio.on('click', function(){
    $('#login-screen').css('display', 'none');
    $(document).on('click', () => {
        document.documentElement.requestFullscreen();
        if(i==0){
            addInputLine();
        }
        i=1;
    });
});

//Gestione del login tramite enter
$(document).on('keydown', (e) => {
    if (e.key === 'Enter') {
        document.documentElement.requestFullscreen();
        $('#login-screen').css('display', 'none');
        addInputLine();
    }
});


$('.window').each(function() {
    const $win = $(this);
    const $bar = $win.find('.title-bar');
    const $maximize = $win.find('.control-button.maximize');

    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    let isMaximized = false;
    let prevState = {};

    $bar.on('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - $win.offset().left;
        offsetY = e.clientY - $win.offset().top;
    });

    $(document).on('mouseup', () => isDragging = false);

    $(document).on('mousemove', function(e) {
        if (isDragging && !isMaximized) {
            $win.css({
                left: e.clientX - offsetX + 'px',
                top: e.clientY - offsetY + 'px'
            });
        }
    });

    $maximize.on('click', function() {
        if (!isMaximized) {
            prevState = {
                top: $win.css('top'),
                left: $win.css('left'),
                width: $win.css('width'),
                height: $win.css('height'),
                resize: $win.css('resize'),
                zIndex: $win.css('z-index')
            };
            $win.css({
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                resize: 'none',
                zIndex: 2
            });
            isMaximized = true;
        } else {
            $win.css(prevState);
            isMaximized = false;
        }
    });
});

function openWindow(id) {
    $('#' + id).css('display', 'block');
}

$('.control-button.close').on('click', function() {
    $(this).closest('.window').hide();
});

//Gestione aperture finestre dato il doppio click
$('#icon1').on('dblclick', function() {openWindow('fotoRete1');});
$('#icon2').on('dblclick', function() {openWindow('tabellaExcel');});
$('#icon3').on('dblclick', function() {openWindow('fotoRete3');});
$('#icon4').on('dblclick', function() {openWindow('fotoRete2');});
$('#icon5').on('dblclick', function() {openWindow('timer');});
$('#icon6').on('dblclick', function() {openWindow('testo');});

// Variabile per tenere traccia del router corrente
let currentRouter = null;

function addInputLine() {
    const $inputLine = $('<div class="input-line"></div>');
    const promptText = currentRouter ? `${currentRouter.name}#` : 'C:\\Users\\Utente>';
    const $prompt = $(`<span>${promptText}</span>`);
    const $input = $('<input autofocus>');

    $input.on('keydown', function(e) {
        handleInput(e, $(this));
    });

    $inputLine.append($prompt).append($input);
    $content.append($inputLine);
    $input.focus();
    $content.scrollTop($content[0].scrollHeight);
}

function handleInput(e, $input) {
    if (e.key === 'Enter') {
        const command = $input.val();
        history.unshift(command);
        historyIndex = -1;
        const promptText = currentRouter ? `${currentRouter.name}#` : 'C:\\Users\\Utente>';
        $input.parent().html(promptText + command);
        executeCommand(command);
       // addInputLine();
    } else if (e.key === 'ArrowUp') {
        if (history.length > 0) {
            historyIndex = (historyIndex + 1) % history.length;
            $input.val(history[historyIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        if (history.length > 0 && historyIndex > 0) {
            historyIndex = (historyIndex - 1 + history.length) % history.length;
            $input.val(history[historyIndex]);
        } else {
            $input.val('');
        }
    }
}

function executeCommand(cmd) {
    let output = '';
    
    // Se siamo in modalità router
    if (currentRouter) {
        handleRouterCommand(cmd);
        return;
    }

    if(cmd.toLowerCase().startsWith('dv') || cmd.toLowerCase().startsWith('ls')){
        checkRoute(cmd);
        return;
    }
    
    if (cmd.toLowerCase().startsWith('ans')) {
        valida(cmd);
        return;
    }
    if (cmd.toLowerCase().startsWith('hint')) {
        daiIndizio(cmd);
        return;
    }
    
    // Comando per accedere a un router
    const parts = cmd.trim().toLowerCase().split(' ');
    if (parts.length === 2 && parts[0] === 'connect' && parts[1].match(/^r[1-6]$/)) {
        const routerName = parts[1].toUpperCase();
        const router = routers.find(r => r.name === routerName);
        
        if (router) {
            // Rimuovi l'evidenziazione da tutti i router
            routers.forEach(r => r.selected = false);
            
            // Evidenzia il router selezionato
            router.selected = true;
            currentRouter = router;
            output = `Connesso al router ${routerName}. Usa 'exit' per disconnetterti.`;
            
            // Ridisegna la topologia per mostrare la selezione
            drawTopology();
        } else {
            output = `Router ${routerName} non trovato!`;
        }
    } 
    else {
        switch (cmd.toLowerCase()) {
            case 'help':
                output = 'PLAY [numero minigioco]    Entra nel minigioco\nHINT [numero minigioco]    Chiedi indizio\nKEY                        Controlla chiave finale\nANS [KEY]                  Inserisci chiave\nCLS                        Pulisce lo schermo';
                break;
            case 'cls':
                $content.html('');
                return;
            case 'play 1':
                minigioco1();
                break;
            case 'play 2':
                minigioco2();
                break;
            case 'play 3':
                minigioco3();
                break;
            case 'key':
                mostraChiave();
                break;
            default:
                output = `'${cmd}' non è riconosciuto come comando interno o esterno,\n un programma eseguibile o un file batch.`;
        }
    }
    
    const $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

function handleRouterCommand(cmd) {
    if (cmd.toLowerCase() === 'exit') {
        currentRouter.selected = false;
        drawTopology();
        const $outputDiv = $('<div></div>').text(`Disconnesso dal router ${currentRouter.name}`);
        $content.append($outputDiv);
        currentRouter = null;
        return;
    }
    
    const parts = cmd.trim().toLowerCase().split(' ');
    let output = '';
    
    if (parts.length === 2 && parts[0] === 'rip') {
        const ipDest = parts[1];
        const routerDest = routers.find(r => r.ip === ipDest);

        if (routerDest) {
            const conn = [currentRouter.id, routerDest.id];
            
            // Verifica se la connessione è tra quelle corrette (rosse)
            const isCorrectConnection = correctConnections.some(c => 
                (c[0] === conn[0] && c[1] === conn[1]) || 
                (c[0] === conn[1] && c[1] === conn[0])
            );

            if (!isCorrectConnection) {
                output = 'Non puoi stabilire questa connessione RIP!';
                const $outputDiv = $('<div></div>').text(output);
                $content.append($outputDiv);
                return;
            }

            const existingCompleted = completedConnections.find(c => 
                (c[0] === conn[0] && c[1] === conn[1]) || 
                (c[0] === conn[1] && c[1] === conn[0])
            );

            if (existingCompleted) {
                output = 'Connessione già completata!';
            } else if (userConnections.some(c => 
                (c[0] === conn[0] && c[1] === conn[1]) || 
                (c[0] === conn[1] && c[1] === conn[0])
            )) {
                completedConnections.push(conn);
                activatedConnections.push(conn);
                output = 'Percorso completato!';
                
                // Controlla se tutti i collegamenti sono fatti
                if (completedConnections.length === correctConnections.length) {
                    gameState.minigame3.completed = true;
                    output += "\nCOMPLIMENTI! Hai completato il minigioco RIP e ottenuto il frammento di key!";
                }
            } else {
                userConnections.push(conn);
                output = 'Percorso iniziato!';
            }
            
            drawTopology();
        } else {
            output = 'IP destinazione non valido!';
        }
    } else {
        output = 'Comando non riconosciuto. Usa: rip [ip destinazione] o exit per uscire';
    }
    
    // Rimuovi la chiamata a addInputLine() qui per evitare doppie linee
    const $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

function mostraChiave() {
    let output = 'Chiave= ';
    gameState.minigame1.completed ? output += 'A ' : output += '? ';
    gameState.minigame2.completed ? output += 'R ' : output += '? ';
    gameState.minigame3.completed ? output += 'P' : output += '?';
    const $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

function daiIndizio(cmd) {
    const parts = cmd.trim().toLowerCase().split(' ');
    let output = "";
    if (totHintUsed() >= 3) {
        output = "Hai già usato tutti gli indizi a tua disposizione";
        $outputDiv = $('<div></div>').text(output);
        $content.append($outputDiv);
        return;
    }
    if (parts.length != 2) {
        output = "Comando non valido, usa 'HELP' per ulteriori informazioni";
        $outputDiv = $('<div></div>').text(output);
        $content.append($outputDiv);
        return;
    }
    switch (parts[1]) {
        case '1':
            switch (gameState.minigame1.hintsUsed) {
                case 0:
                    output = "6 righe della tabella rimangono invariate";
                    break;
                case 1:
                    output = "Le righe 2, 3, 4, 5, 7, 8 rimangono invariate";
                    break;
                case 2:
                    output = "Per la rete B vanno moficiati COST e NEXT HOP, la rete C va aggiunta in fondo alla tabella";
                    break;
            }
            gameState.minigame1.hintsUsed++;
            output += "\nHai ancora " + (3 - totHintUsed()) + " indizi a disposizione";
            break;
        case '2':
            switch (gameState.minigame2.hintsUsed) {
                case 0:
                    output = "Ricorda che il protocollo Link State ha come metrica il costo, mentre il Distance Vector gli hop.";
                    break;
                case 1:
                    output = "Devi attraversare 3 router per il Link State e 2 per il Distance Vector.";
                    break;
                case 2:
                    output = "I router che devi attraversare sono R1, R7, R8, R10 (uno di questi va inserito per entrambi i metodi).";
                    break;
            }
            gameState.minigame2.hintsUsed++;
            output += "\nHai ancora " + (3 - totHintUsed()) + " indizi a disposizione";
            break;
        case '3':
            switch (gameState.minigame3.hintsUsed) {
                case 0:
                    output = "Ricorda che il comando RIP va eseguito su entrambi i router comunicanti.";
                    break;
                case 1:
                    output = "Devi scrivere in totale otto comandi per impostare il RIP.";
                    break;
                case 2:
                    output = "Per completare il minigioco devi eseguire il comando RIP tra: R1-R5; R2-R5; R3-R5; R4-R5\nOgni comando va ripetuto invertendo i router";
                    break;
            }
            gameState.minigame3.hintsUsed++;
            output += "\nHai ancora " + (3 - totHintUsed()) + " indizi a disposizione";
            break;
        default:
            output = "Impossibile trovare il minigioco " + parts[1];
    }
    $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

// Gestione finestra Excel
const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cols = 50;
const rows = 100;
const $colHeaders = $('.col-headers');
const $rowHeaders = $('.row-headers');
const $cells = $('.cells-container');
for (let i = 0; i < cols; i++) {
    let letter = colLetters[i % 26];
    if (i >= 26) {
        letter = colLetters[Math.floor(i / 26) - 1] + letter;
    }
    $colHeaders.append(`<div>${letter}</div>`);
}
for (let i = 1; i <= rows; i++) {
    $rowHeaders.append(`<div>${i}</div>`);
}
var cellValues = {
    1: ["NET", "COST", "NEXT HOP"],
    2: ["R1", "3", "-"],
    3: ["R2", "2", "-"],
    4: ["R3", "4", "-"],
    5: ["A", "5", "R1"],
    6: ["B", "7", "R2"],
    7: ["G", "6", "R1"],
    8: ["E", "8", "R1"]
};
for (let r = 1; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
        let input = $('<input class="inputExcel" type="text">');
        if (r <= 9 && c <= 2) {
            input.addClass('special');
            let idStr = `R${r}C${c}`;
            input.attr('id', idStr);
        }

        if (cellValues[r] && c < cellValues[r].length) {
            input.val(cellValues[r][c]);
        }
        $cells.append(input);
    }
}

function minigioco1() {
    let output = "BENVENUTO NEL MINIGIOCO 1!\n\nIl tuo compito è quello di costruire una tabella di routing di una rete dopo che un router ti ha inviato i suoi distance vector.\nPuoi trovare una rappresentazione della rete aprendo SchemaRete1.png. Quest'ultima era inizialmente formata da tre router, poi è stato aggiunto R4. R1 e R2 hanno già mandato i loro distance vector, modifica la tabella TabellaR.xlcs dopo che R3 ti ha inviato il seguente DVP:\nR3: A/3; B/2; E/4; C/5\n\nDopo che avrai completato la tabella clica il tasto salva su excel, se avrai completato correttamente la tabella avrai risolto il minigioco.";
    $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

$("#salvaExcel").click(function() {
    let giusto = true;
    if ($("#R2C0").val().toUpperCase() != "R1" || $("#R2C1").val() != "3" || $("#R2C2").val() != "-" ||
        $("#R3C0").val().toUpperCase() != "R2" || $("#R3C1").val() != "2" || $("#R3C2").val() != "-" ||
        $("#R4C0").val().toUpperCase() != "R3" || $("#R4C1").val() != "4" || $("#R4C2").val() != "-" ||
        $("#R5C0").val().toUpperCase() != "A" || $("#R5C1").val() != "5" || $("#R5C2").val().toUpperCase() != "R1" ||
        $("#R6C0").val().toUpperCase() != "B" || $("#R6C1").val() != "6" || $("#R6C2").val().toUpperCase() != "R3" ||
        $("#R7C0").val().toUpperCase() != "G" || $("#R7C1").val() != "6" || $("#R7C2").val().toUpperCase() != "R1" ||
        $("#R8C0").val().toUpperCase() != "E" || $("#R8C1").val() != "8" || $("#R8C2").val().toUpperCase() != "R1" ||
        $("#R9C0").val().toUpperCase() != "C" || $("#R9C1").val() != "9" || $("#R9C2").val().toUpperCase() != "R3") {
        if ($("#R8C2").val().toUpperCase() == "R3") {
            giusto = true;
        } else {
            giusto = false;
        }
    }
    let output = "";
    if (giusto) {
        gameState.minigame1.completed = true;
        $("#tabellaExcel").css("display", "none");
        output = "COMPLIMENTI, hai risolto il minigioco 1!\n";
    } else {
        output = "Errore, non hai completato correttamente la tabella del minigioco 1\n";
    }
    $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
    addInputLine();
});


function valida(cmd) {
    const parts = cmd.trim().toLowerCase().split(' ');
    let output = "";
    if (parts.length === 2 && parts[1] === 'arp') {
        output = "COMPLIMENTI, hai risolto tutti gli enigmi di questa stanza!";
        setTimeout(function() {
            $(".loader").css("display", "flex");
            checkAndProceed();
        }, 2000);
    } else {
        output = "Chiave non valida";
    }
    $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}


function minigioco2(){
    let output = "BENVENUTO NEL MINIGIOCO 2!\n\nPer risolvere questo compito devi trovare i cammini minimi!\n\nApri il file SchemaRete2.png e trova le due route più convenienti da R0 ad R6. Devi utilizzare i protocolli Link State e Distance Vector. \n\nPer inserire la risposta, nel caso del Link State digitare: ls [nome router]-[nome-router]-[nome router]... indicando il cammino da percorrere. \n\nPer inserire la risposta, nel caso del Distance Vector digitare: dv [nome router]-[nome-router]-[nome router]... indicando il cammino da percorrere. \n\nI nomi dei router devono essere scritti come indicato, distanziati da -. Non inserire i router iniziale e finale. Buon lavoro!\n";
    $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

var varls = false; //Link State completato?
var vardv = false; //Distance Vector completato?
var erRoute = false; //Ci sonob errori?

function checkRoute(cmd) {

    if(gameState.minigame2.completed === false){
        cmd = cmd.toLowerCase().trim();
    
        if (cmd === 'ls r10-r8-r7') {
            varls = true;
            erRoute = false;
        } else if (cmd === 'dv r1-r7') {
            vardv = true;
            erRoute = false;
        } else {
            let output = "La risposta data non è corretta, ritenta.";
            const $outputDiv = $('<div></div>').text(output);
            $content.append($outputDiv);
            erRoute = true;
        }
        
        if (!erRoute) {
            if (varls && vardv) {
                let output = "COMPLIMENTI, hai risolto il minigioco 2!";
                const $outputDiv = $('<div></div>').text(output);
                $content.append($outputDiv);
                gameState.minigame2.completed = true;
            } else if (varls) {
                let output = "Hai risolto la parte Link State del minigioco 2!";
                const $outputDiv = $('<div></div>').text(output);
                $content.append($outputDiv);
            } else if (vardv) {
                let output = "Hai risolto la parte Distance Vector del minigioco 2!";
                const $outputDiv = $('<div></div>').text(output);
                $content.append($outputDiv);
            }
        }
    }else{
        let output = "Il minigioco 2 è già stato completato!";
        const $outputDiv = $('<div></div>').text(output);
        $content.append($outputDiv);
    }
}


function minigioco3() {
    let output = "BENVENUTO NEL MINIGIOCO 3!\n\nIl tuo compito è quello di ristabilire i collegamenti tra i vari router attraverso l'utilizzo del protocollo RIP.\nAccedi ad ogni router con il comando CONNECT [nome del router] e sfrutta il comando RIP [IP router destinatario] per stabilire le connessioni mancanti.\n\nUna volta ristabilite tutte le connessioni, riceverai il frammento di key mancante per proseguire";
    $outputDiv = $('<div></div>').text(output);
    $content.append($outputDiv);
}

// Definizione dei router e connessioni
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const routers = [
    { x: 100, y: 100, id: 0, ip: '192.168.1.1', name: 'R1', selected: false },
    { x: 500, y: 100, id: 1, ip: '192.168.2.2', name: 'R2', selected: false },
    { x: 100, y: 500, id: 2, ip: '192.168.3.3', name: 'R3', selected: false },
    { x: 500, y: 500, id: 3, ip: '192.168.4.4', name: 'R4', selected: false },
    { x: 300, y: 300, id: 4, ip: '192.168.5.5', name: 'R5', selected: false },
    { x: 300, y: 550, id: 5, ip: '192.168.6.6', name: 'R6', selected: false }
];

const allConnections = [];
const correctConnections = [[0, 4], [1, 4], [2, 4], [3, 4]];
const userConnections = [];
const completedConnections = [];
const activatedConnections = [];

function generateConnections() {
    for (let i = 0; i < routers.length; i++) {
        for (let j = i + 1; j < routers.length; j++) {
            allConnections.push([i, j]);
        }
    }
}

function drawTopology() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna le connessioni
    for (let conn of allConnections) {
        const [id1, id2] = conn;
        const router1 = routers[id1];
        const router2 = routers[id2];
        let color = 'black';

        if (correctConnections.some(c => (c[0] === id1 && c[1] === id2) || (c[0] === id2 && c[1] === id1))) {
            color = 'red';
        }

        if (userConnections.some(c => (c[0] === id1 && c[1] === id2) || (c[0] === id2 && c[1] === id1))) {
            color = 'yellow';
        }

        if (completedConnections.some(c => (c[0] === id1 && c[1] === id2) || (c[0] === id2 && c[1] === id1))) {
            color = 'green';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(router1.x, router1.y);
        ctx.lineTo(router2.x, router2.y);
        ctx.stroke();

        if (activatedConnections.some(c => (c[0] === id1 && c[1] === id2) || (c[0] === id2 && c[1] === id1))) {
            drawActivationCircle(router1.x, router1.y);
            drawActivationCircle(router2.x, router2.y);
        }
    }

    // Disegna i router
    for (let router of routers) {
        // Disegna il cerchio esterno giallo se il router è selezionato
        if (router.selected) {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(router.x, router.y, 25, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Disegna il cerchio interno blu
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(router.x, router.y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(router.name, router.x, router.y);

        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';

        ctx.fillText(router.ip, router.x, router.y + (["R3", "R4", "R6"].includes(router.name) ? 30 : -30));
    }
}

function drawActivationCircle(x, y) {
    ctx.fillStyle = 'limegreen';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
}

// Inizializza la topologia
generateConnections();
drawTopology();

//COMMON JS
// Sistema di navigazione tra stanze
const totalRooms = 7;
let currentRoom ;
let seconds = 0;
let timerInterval;

// Inizializzazione
$(document).ready(function() {
    // Determina la stanza corrente dal percorso
    const pathParts = window.location.pathname.split('/');
    const roomPart = pathParts[pathParts.length - 2]; // room1, room2, etc.
    if (roomPart && roomPart.startsWith('room')) {
        currentRoom = parseInt(roomPart.replace('room', ''));
        console.log("currentRoom"+currentRoom)
    }
    
    // Carica i progressi salvati
    loadProgress();
    
    
    // Inizializza il timer
    startTimer();
    
    // Gestione indizi
    //$("#hint-btn").click(showHint);
   
});

// Verifica completamento e passaggio alla stanza successiva
function checkAndProceed() {
        // Mostra messaggio di successo
        $(".success-message").fadeIn();
              // Salva il progresso alla stanza successiva
        saveProgress(Math.max(currentRoom + 1, localStorage.getItem('escapeRoomProgress')));

        // Naviga alla prossima stanza o alla vittoria
        if (currentRoom < totalRooms) {
            setTimeout(function() {
                window.location.href = '../room' + (currentRoom + 1) + '/index.html';
            }, 3000);
        } else {
            // Calcola e salva le statistiche
            const startTime = localStorage.getItem('escapeRoomStartTime');
            const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : seconds;
            localStorage.setItem('escapeRoomCompletionTime', elapsedTime);
            
            // Vai alla pagina di vittoria
            setTimeout(function() {
                window.location.href = '../../victory.html';
            }, 3000);
        }
}

// Funzioni per salvare/caricare progressi
function saveProgress(roomNumber) {
    localStorage.setItem('escapeRoomProgress', roomNumber);
}

function loadProgress() {
    // Se non esiste un progresso, inizializza a 1
   if (!localStorage.getItem('escapeRoomProgress')) {
        localStorage.setItem('escapeRoomProgress', 1);
    }
}

// Sistema timer
function startTimer() {
    // Carica il tempo totale dall'inizio
    const startTime = localStorage.getItem('escapeRoomStartTime');
    if (startTime) {
        seconds = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    }
    
    // Aggiorna il timer ogni secondo
    timerInterval = setInterval(function() {
        seconds++;
        updateTimerDisplay();
    }, 1000);
    
    // Aggiorna il display immediatamente
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const timeString = 
        (hours > 0 ? (hours < 10 ? '0' : '') + hours + ':' : '') +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    
    $("#timer-display").css("top", "50%");
    $("#timer-display").text(timeString);
}