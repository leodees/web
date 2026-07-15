document.addEventListener('DOMContentLoaded', function () {

    // ============ DATA AURA ============
    // Tiap level cocok buat angka tinggi (>=ambang) & tiap sisi (positif/negatif).
    // Dipilih acak biar tiap scan kerasa beda meski nama & levelnya sama.

    const TIER_POSITIF = [
        { min: 5000, opsi: ["tinggi1","tinggi2"] },
        { min: 0, opsi: ["medium1"] }
    ];

    const TIER_NEGATIF = [
        { min: 0, opsi: ["negatif1", "negatif2"] }
    ];

    const QUOTES = [
        "*kamu telah diperingatkan.*",
        "*jangan salahkan sistem kalau baper.*",
        "*ini bukan hoax, ini sains ngasal bersertifikat.*",
        "*hasil tidak bisa diganggu gugat, seperti takdir.*",
        "*screenshot ini, tunjukin ke gebetan.*"
    ];

    // Peluang kecil buat easter egg glitch, biar tetep absurd & gak ketebak
    const PELUANG_GLITCH = 0.06;

    function pilihAcak(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function ambilTier(magnitude, positif) {
        const daftar = positif ? TIER_POSITIF : TIER_NEGATIF;
        const cocok = daftar.find(t => magnitude >= t.min);
        return pilihAcak(cocok.opsi);
    }

    function generateAura() {
        // Kemungkinan hasil ngaco total (easter egg)
        if (Math.random() < PELUANG_GLITCH) {
            return {
                glitch: true,
                display: "ERR_404+++",
                tier: "AURA TIDAK TERDETEKSI // SINYAL HILANG",
                positif: true
            };
        }

        const magnitude = Math.floor(Math.random() * 9000) + 1000; // 1000 - 9999
        const positif = Math.random() < 0.5;
        const simbol = positif ? "+++" : "---";

        return {
            glitch: false,
            magnitude: magnitude,
            positif: positif,
            display: `${magnitude}${simbol}`,
            tier: ambilTier(magnitude, positif)
        };
    }

    // ============ ELEMEN ============
    const input = document.getElementById('namaInput');
    const btn = document.getElementById('btnCek');
    const overlay = document.getElementById('auraOverlay');
    const modal = document.getElementById('auraModal');
    const modalNama = document.getElementById('modalNama');
    const modalNumber = document.getElementById('modalNumber');
    const modalTier = document.getElementById('modalTier');
    const modalQuote = document.getElementById('modalQuote');
    const modalClose = document.getElementById('modalClose');
    const modalOk = document.getElementById('modalOk');
       const video = document.createElement('video');


    let sedangProses = false;

    function animasiHitungAngka(targetDisplay, positif, glitch) {
        if (glitch) {
            modalNumber.textContent = targetDisplay;
            return;
        }
        const targetNum = parseInt(targetDisplay, 10);
        const durasi = 900;
        const mulai = performance.now();

        function tick(now) {
            const progress = Math.min((now - mulai) / durasi, 1);
            const nilaiSekarang = Math.floor(progress * targetNum);
            const simbol = positif ? "+++" : "---";
            modalNumber.textContent = `${nilaiSekarang}${simbol}`;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                modalNumber.textContent = targetDisplay;
            }
        }
        requestAnimationFrame(tick);
    }

    function hentikanVideo() {
        if (video && typeof video.pause === 'function') {
            video.pause();
            video.currentTime = 0;
        }
    }

    function tampilkanHasil(nama, hasil) {
        modalNama.textContent = `NAMA: ${nama.toUpperCase()}`;
        hentikanVideo();
        modalTier.innerHTML = '';
        

        if (!hasil.glitch) {
            video.src = `Meme/${hasil.tier}.mp4`;
            video.autoplay = true;
            video.muted = false;
            video.loop = true;
            video.playsInline = false;
            video.preload = 'auto';
            video.volume = 1;
            video.className = 'modal-video';
            modalTier.appendChild(video);

            video.play().catch(() => {
                console.log('Audio/video tidak bisa autoplay, tetapi file sudah siap diputar.');
            });
        } else {
            modalTier.textContent = 'SINYAL HILANG';
        }

        modalQuote.textContent = pilihAcak(QUOTES);

        modal.classList.remove('positif', 'negatif', 'glitch-mode');
        if (hasil.glitch) {
            modal.classList.add('glitch-mode');
        } else if (hasil.positif) {
            modal.classList.add('positif');
        } else {
            modal.classList.add('negatif');
        }

        overlay.classList.add('active');
        modalNumber.textContent = '0';
        animasiHitungAngka(hasil.display, hasil.positif, hasil.glitch);
    }

    function tutupModal() {
        overlay.classList.remove('active');
        hentikanVideo();
    }

    function jalankanCek() {
        if (sedangProses) return;

        const nama = input.value.trim();
        if (!nama) {
            input.classList.add('input-error');
            input.placeholder = "eits, ketik nama dulu, jangan gaib!";
            setTimeout(() => input.classList.remove('input-error'), 600);
            return;
        }

        sedangProses = true;
        const teksAsli = btn.innerHTML;
        btn.innerHTML = "MENGANALISIS... 💀";
        btn.disabled = true;
        btn.classList.add('loading');

        setTimeout(() => {
            const hasil = generateAura();
            tampilkanHasil(nama, hasil);

            btn.innerHTML = teksAsli;
            btn.disabled = false;
            btn.classList.remove('loading');
            sedangProses = false;
        }, 1200);
    }

    // Klik tombol
    btn.addEventListener('click', jalankanCek);

    // Otomatis langsung cek begitu user pencet ENTER di input nama
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            jalankanCek();
        }
    });

    // Tutup modal
    modalClose.addEventListener('click', tutupModal);
    modalOk.addEventListener('click', tutupModal);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) tutupModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') tutupModal();
    });
});