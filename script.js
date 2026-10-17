// --- 1. MẬT KHẨU BẢO VỆ TRANG WEB ---
function checkPassword(e) {
    e.preventDefault();
    const inputPass = document.getElementById('site-password').value;
    
    // 🔑 MẬT KHẨU TRANG WEB Ở ĐÂY
    const correctPassword = "9a1"; 

    if (inputPass === correctPassword) {
        document.getElementById('password-screen').style.display = 'none';
        const mainContent = document.getElementById('main-content');
        mainContent.classList.remove('hidden');
        mainContent.classList.add('flex');
        
        initParticles();
    } else {
        const errorMsg = document.getElementById('error-msg');
        errorMsg.classList.remove('hidden');
        document.getElementById('site-password').value = '';
    }
}


// --- 2. CANVAS PARTICLE ANIMATION (HOA ĐÀO / LẤP LÁNH / TRÁI TIM) ---
let canvas, ctx, width, height;
let particles = [];
const particleCount = 45;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.type = Math.random() > 0.4 ? 'petal' : (Math.random() > 0.5 ? 'heart' : 'star');
    }

    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y / 30) + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.type === 'petal') {
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
            ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
            ctx.fill();
        } else if (this.type === 'heart') {
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            let topCurveHeight = this.size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
            ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
            ctx.fill();
        } else {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function initParticles() {
    canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    particles = [];
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    animateParticles();
}

function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}


// --- 3. NHẠC NỀN DU DƯƠNG (WEB AUDIO API) ---
let audioCtx = null;
let isPlaying = false;
let timerId = null;

const musicalNotes = [
    261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88,
    523.25, 587.33, 659.25, 698.46, 783.99
];

const songMelody = [
    { note: 4, duration: 0.6 },
    { note: 7, duration: 0.6 },
    { note: 9, duration: 0.8 },
    { note: 7, duration: 0.6 },
    { note: 4, duration: 0.6 },
    { note: 2, duration: 0.8 },
    { note: 0, duration: 0.6 },
    { note: 4, duration: 0.6 },
    { note: 7, duration: 1.0 },
    { note: 11, duration: 0.8 },
    { note: 9, duration: 0.8 },
    { note: 7, duration: 0.8 }
];

let noteIndex = 0;

function playMelodyNote() {
    if (!isPlaying || !audioCtx) return;

    const item = songMelody[noteIndex];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(musicalNotes[item.note], audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + item.duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + item.duration);

    noteIndex = (noteIndex + 1) % songMelody.length;
    timerId = setTimeout(playMelodyNote, item.duration * 850);
}

function toggleAudio() {
    const btnText = document.getElementById('audio-text');
    const btnIcon = document.getElementById('audio-icon');

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!isPlaying) {
        isPlaying = true;
        playMelodyNote();
        btnText.textContent = "Tắt Nhạc";
        btnIcon.className = "fa-solid fa-volume-high text-amber-300 animate-bounce";
    } else {
        isPlaying = false;
        clearTimeout(timerId);
        btnText.textContent = "Phát Nhạc";
        btnIcon.className = "fa-solid fa-music text-rose-400";
    }
}


// --- 4. BẮN PHÁO HOA & MƯA TRÁI TIM ---
function triggerFireworks() {
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.2 },
        colors: ['#f43f5e', '#fbbf24', '#f472b6', '#ffffff']
    });
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.8 },
        colors: ['#f43f5e', '#fbbf24', '#f472b6', '#ffffff']
    });
}

function burstHearts() {
    const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['heart'],
        colors: ['#FF1493', '#FF69B4', '#FFC0CB', '#FF4500']
    };

    confetti({
        ...defaults,
        particleCount: 50,
        scalar: 2
    });
}


// --- 5. TƯƠNG TÁC THIỆP 3D & HIỆU ỨNG GÕ CHỮ ---
let isCardOpen = false;
const mainCardText = "Kính chúc Cô Mỹ Thắm luôn tràn đầy sức khỏe, mãi xinh đẹp, trẻ trung và cùng tập thể 9A1 gặt hái thành công rực rỡ trong năm học cuối cấp quan trọng này!";
let typewriterIndex = 0;
let isTyping = false;

function runTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (typewriterIndex < mainCardText.length) {
        el.innerHTML += mainCardText.charAt(typewriterIndex);
        typewriterIndex++;
        setTimeout(runTypewriter, 35);
    } else {
        isTyping = false;
    }
}

function toggleEnvelope() {
    const env = document.getElementById('envelope');
    const seal = document.getElementById('seal');
    const btnText = document.getElementById('open-btn-text');

    if (!isCardOpen) {
        env.classList.add('open');
        seal.style.opacity = '0';
        seal.style.pointerEvents = 'none';
        btnText.textContent = "Gấp Thiệp Lại";
        isCardOpen = true;

        triggerFireworks();
        if (!isPlaying) {
            toggleAudio();
        }

        if (!isTyping && typewriterIndex === 0) {
            isTyping = true;
            setTimeout(runTypewriter, 700);
        }
    } else {
        env.classList.remove('open');
        seal.style.opacity = '1';
        seal.style.pointerEvents = 'auto';
        btnText.textContent = "Mở Thiệp Chúc Mừng 3D";
        isCardOpen = false;
    }
}


// --- 6. CAROUSEL THƠ & LỜI CHÚC NGẮN ---
const wishesData = [
    {
        type: "Bài Thơ Dành Tặng Cô Mỹ Thắm",
        content: `"Tháng Mười hai mươi ngập sắc hồng,<br>Gửi Cô Mỹ Thắm trọn niềm mong.<br>9A1 nguyện chăm ngoan học,<br>Đáp nghĩa ơn Cô thỏa tấm lòng!"`,
        author: "Tập thể 9A1"
    },
    {
        type: "Lời Chúc Tự Hào",
        content: `"Cảm ơn Cô Mỹ Thắm đã luôn là ngọn hải đăng soi sáng đường đi cho 9A1. Chúc Cô ngày 20/10 ngập tràn hoa tươi, quà đẹp và luôn tươi nụ cười trên môi!"`,
        author: "Học sinh Lớp 9A1"
    },
    {
        type: "Thông Điệp Tri Ân",
        content: `"Cô không chỉ dạy chúng em tri thức mà còn dạy chúng em cách sống, cách làm người. Chúc Cô Mỹ Thắm 20/10 thật ngập tràn hạnh phúc và luôn thương yêu 9A1!"`,
        author: "Gia đình 9A1"
    }
];

let currentWishIndex = 0;

function renderWish() {
    const container = document.getElementById('wish-carousel');
    const counter = document.getElementById('wish-counter');
    if (!container) return;

    const item = wishesData[currentWishIndex];
    container.innerHTML = `
        <div class="animate-fade-in transition-all">
            <p class="text-xs text-amber-300 font-semibold mb-2 flex items-center justify-center gap-2">
                <i class="fa-solid fa-feather-pointed"></i> ${item.type}
            </p>
            <p class="font-handwriting text-xl sm:text-2xl text-rose-100 leading-relaxed max-w-2xl mx-auto">
                ${item.content}
            </p>
            <p class="text-xs text-rose-300/80 mt-3 font-medium">-- ${item.author} --</p>
        </div>
    `;
    counter.textContent = `${currentWishIndex + 1} / ${wishesData.length}`;
}

function nextWish() {
    currentWishIndex = (currentWishIndex + 1) % wishesData.length;
    renderWish();
}

function prevWish() {
    currentWishIndex = (currentWishIndex - 1 + wishesData.length) % wishesData.length;
    renderWish();
}


// --- 7. WISH WALL & QUẢN LÝ LƯU BÚT (THÊM / XÓA / LƯU LOCALSTORAGE) ---
let initialWishes = JSON.parse(localStorage.getItem('wishes_9A1')) || [
    { name: "Vũ Quang Nguyên (Lớp Trưởng)", wish: "Chúc Cô Mỹ Thắm 20/10 luôn xinh đẹp và bao dung cho lũ học trò 9A1 hay nghịch ngợm ạ!", color: "from-rose-500/30 to-pink-500/20" },
    { name: "Bảo Nhi", wish: "Kính chúc Cô Mỹ Thắm thật nhiều sức khỏe, luôn vui vẻ mỗi khi bước vào lớp 9A1!", color: "from-amber-500/30 to-rose-500/20" },
    { name: "Huy Khánh", wish: "Cảm ơn Cô Mỹ Thắm đã đồng hành cùng 9A1 qua bao đợt ôn thi vất vả. Yêu Cô nhiều!", color: "from-purple-500/30 to-pink-500/20" }
];

function renderWishWall() {
    const wall = document.getElementById('wish-wall');
    if (!wall) return;

    wall.innerHTML = initialWishes.map((item, index) => `
        <div class="bg-gradient-to-br ${item.color} border border-white/20 p-4 rounded-2xl shadow-lg backdrop-blur-sm transition hover:scale-[1.02] relative group">
            <!-- Nút Xóa Lời Chúc (Icon Thùng Rác) -->
            <button onclick="deleteWish(${index})" class="absolute top-3 right-3 text-rose-200/50 hover:text-white bg-black/30 hover:bg-rose-600 w-7 h-7 rounded-full flex items-center justify-center transition text-xs shadow" title="Xóa lời chúc">
                <i class="fa-solid fa-trash-can"></i>
            </button>

            <div class="flex items-center justify-between mb-2 pr-8">
                <span class="font-bold text-sm text-amber-200 flex items-center gap-1.5">
                    <i class="fa-solid fa-user-graduate text-xs text-rose-300"></i> ${item.name}
                </span>
            </div>
            <p class="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                "${item.wish}"
            </p>
        </div>
    `).join('');
}

function addStudentWish(e) {
    e.preventDefault();
    const nameInput = document.getElementById('student-name');
    const wishInput = document.getElementById('student-wish');

    if (nameInput.value.trim() && wishInput.value.trim()) {
        const colors = [
            "from-rose-500/30 to-pink-500/20",
            "from-amber-500/30 to-rose-500/20",
            "from-purple-500/30 to-pink-500/20",
            "from-emerald-500/30 to-teal-500/20"
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        initialWishes.unshift({
            name: nameInput.value.trim(),
            wish: wishInput.value.trim(),
            color: randomColor
        });

        // Lưu vào localStorage
        localStorage.setItem('wishes_9A1', JSON.stringify(initialWishes));

        renderWishWall();
        burstHearts();

        nameInput.value = '';
        wishInput.value = '';
    }
}

// Hàm Xóa Lời Chúc
function deleteWish(index) {
    if (confirm("Bạn có chắc chắn muốn xóa lời chúc này không?")) {
        initialWishes.splice(index, 1); // Xóa phần tử tại vị trí index
        localStorage.setItem('wishes_9A1', JSON.stringify(initialWishes)); // Cập nhật lại bộ nhớ
        renderWishWall(); // Vẽ lại tường lưu bút
    }
}

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", () => {
    renderWish();
    renderWishWall();
});
