var playStopButton;
var sliderVolume;
var jumpButton;
var dryWetLowpass;
var ouputVolLowpass;
var dryWetDynamic;
var outputVolDynamic;
var dryWetDistortion;
var outputVolDistortion;
var dryWetReverb;
var outputVolReverb;
var playButton;
var stopButton;
var pauseButton;
var skipToStart;
var skipToEnd;
var loopButton;
var record;
var reverseButton;
var mic, recorder, soundFileRec;
var state = 0;
var lowpassFilter;
var dynamicCompressor;
var inputSelect;
var audioInput;
var filterSelect;
var val;
var waveshaperDistortion;
var reverbFilter;
var reverseFlag = false; 
var delayEffect;
var fft;
var masterVol;
var cutoffFreq;
var distortionAmt;
var oversampleSlider;
var durationSlider;
var decaySlider;
var volume;
var spectrum;
var fft2;
var soundFile;

function preload() {
    soundFormats('mp3', 'wav');
    soundFile = loadSound('./assets/ethereal88-rising-dawn.mp3');
}

function setup() {
    createCanvas(1200, 800);
    background(255);
    
    // Lowpass Filter Dropdown
    filterSelect = createSelect();
    filterSelect.size(80);
    filterSelect.position(120, 190);
    filterSelect.option('low-pass');
    filterSelect.option('high-pass');
    filterSelect.option('band-pass');
    val = filterSelect.value();
    filterSelect.changed(filterChange);
    
    // Audio Input Dropdown
    inputSelect = createSelect();
    inputSelect.size(140,50);
    inputSelect.position(700, 10);
    inputSelect.option('Pre-loaded Sound');
    inputSelect.option('Mic input');
    audioInput = inputSelect.value();
    console.log(audioInput);
    inputSelect.changed(recInputChange);
    
    // Initialising Respective Constructors
    lowpassFilter = new p5.Filter();
    lowpassFilter.setType("lowpass");
    dynamicCompressor = new p5.Compressor();
    waveshaperDistortion = new p5.Distortion();
    reverbFilter = new p5.Reverb();

    // Initialise Delay Effect
    delayEffect = new p5.Delay();
    delayEffect.process(lowpassFilter, 0.5, 0.4, 2300);
    delayEffect.drywet(0.5); 
    
    // Chaining
    soundFile.disconnect();
    fft2 = new p5.FFT();
    fft2.setInput(soundFile);
    soundFile.connect(lowpassFilter);
    
    lowpassFilter.chain(waveshaperDistortion, delayEffect, dynamicCompressor, reverbFilter);
    fft = new p5.FFT();
    fft.setInput(lowpassFilter.chain(waveshaperDistortion, delayEffect, dynamicCompressor, reverbFilter));

    // Initialisations for Recording Function
    mic = new p5.AudioIn();
    recorder = new p5.SoundRecorder();
    recorder.setInput(mic);
    soundFileRec = new p5.SoundFile();
    
    // Add All Graphics
    guiConfiguration();
}

// self written code start
function draw() {
    background(35, 31, 32);
    
    // Draw All Background Colours of Controls
    guiColours();
    
    // Draw All Labels
    labels();
    
    // Master Volume Bar Fill
    noFill();
    fill(0,200,0);
    rect(785, 280, 30, -masterVol.value());   

    // Master Volume Bar
    push();
    noFill();
    stroke(0);
    rect(785, 280, 30, -100);
    pop();
    
    // Lowpass Filter Functionalities
    lowpassFilter.set(cutoffFreq.value());
    lowpassFilter.res(resSlider.value());
    lowpassFilter.drywet(dryWetLowpass.value());
    lowpassFilter.amp(ouputVolLowpass.value());
    
    // Waveshaper Distortion Functionalities
    var os;
    if(oversampleSlider.value() == 0){
        os = "none";
    }
    else if( oversampleSlider.value() == 2){
        os = "2x";
    }
    else if(oversampleSlider.value() == 4){
        os = "4x"
    }
    waveshaperDistortion.set(distortionAmt.value(), os);
    waveshaperDistortion.drywet(dryWetDistortion.value());
    waveshaperDistortion.amp(outputVolDistortion.value());
    
    // Dynamic Compressor Functionalities
    dynamicCompressor.attack(attackSlider.value());
    dynamicCompressor.knee(kneeSlider.value());
    dynamicCompressor.release(releaseSlider.value());
    dynamicCompressor.ratio(ratioSlider.value());
    dynamicCompressor.threshold(thresholdSlider.value());
    dynamicCompressor.drywet(dryWetDynamic.value());
    dynamicCompressor.amp(outputVolDynamic.value());
    
    // Reverb Functionalities
    reverbFilter.drywet(dryWetReverb.value());
    reverbFilter.amp(outputVolReverb.value());
    dryWetReverb.changed(cb);
    
    // Master Volume Functionalities
    volume = masterVol.value();
    volume = map(volume, 0, 100, 0, 1);
    soundFile.setVolume(volume);
        
    // Spectrum In Visualisation
    var h1 = 500;
    var w1 = 730;
    spectrum = fft2.analyze();
    noStroke();
    fill(255, 218, 34);
    for(i=0;i<spectrum.length;i++){
        f = map(i, 0, spectrum.length, w1, 1030);
        Y = -h1 + map(spectrum[i], 0, 255, h1, 300);
        rect(f, h1, w1/spectrum.length, Y)
    }
    
    // Spectrum Out Visualisation
    var h = 700;
    var w = 730;
    X = fft.analyze();
    noStroke();
    fill(186, 59, 70);
    for(i=0;i<X.length;i++){
        f = map(i, 0, X.length, w, 1030);
        Y = -h + map(X[i], 0, 255, h, 500);
        rect(f, h, w/X.length, Y)
    }
}

// Function to Handle Audio Input Type
function recInputChange() {
    stopSound();
    audioInput = inputSelect.value();
    
    if(audioInput=='Mic input'){
        mic.start();
        recorder.setInput(mic);
        fft2.setInput(mic);
    }
    
    if(audioInput=='Pre-loaded Sound'){
        mic.stop();
        recorder.setInput(lowpassFilter.chain(waveshaperDistortion,dynamicCompressor,reverbFilter));
        fft.setInput(lowpassFilter.chain(waveshaperDistortion,dynamicCompressor,reverbFilter));
    }
}

function cb() {
    reverbFilter.set(durationSlider.value(), decaySlider.value(), reverseFlag);
}

function guiColours() {
    // Lowpass Filter Background
    fill(255, 191, 0);
    rect(15, 70, 282, 260);
    
    // Dynamic Compressor Background
    fill(232, 63, 111);
    rect(297, 70, 420, 340);

    // Reverb Background
    fill(196, 198, 231);
    rect(15, 330, 282, 370);
    
    // Waveshaper Distortion Background
    fill(50, 147, 111);
    rect(297, 410, 280, 290);
    
    // Delay Background
    fill(255, 150, 0, 100);
    rect(577, 410, 140, 290);

    // Master Volume Background
    fill(225, 116, 53);
    rect(730, 100, 140, 220);
    
    // Spectrum Out Background
    push();
    fill(150, 173, 200);
    stroke(0);
    rect(730, 500, 300, 200);
    pop();
    
    // Spectrum In Background
    push();
    fill(150, 173, 200);
    stroke(0);
    rect(730, 300, 300, 200);
    pop();
}

function labels() {
    fill(0);
    textSize(17);
    // Section Titles
    text('Filters', 130, 95);
    text('Dynamic Compressor', 430, 95);
    text('Reverb', 125, 380);
    text('Waveshaper Distortion', 350, 450);
    text('Master Volume', 745, 165);
    text('Delay', 625, 450);

    text('Spectrum In', 740, 330);
    text('Spectrum Out', 740, 530);

    textSize(13);
    // Lowpass Filter Label
    text('Cut-off Frequency', 35, 157);
    text('Resonance', 190, 157);
    text('Dry/Wet', 70, 315);
    text('Output Volume', 185, 315);

    // Dynamic Compressor Label
    text('Attack', 350, 157);
    text('Knee', 490, 157);
    text('Release', 625, 157);
    text('Ratio', 420, 240);
    text('Threshold', 550, 240);
    text('Dry/Wet',415, 400);
    text('Output Volume', 540, 400);

    // Reverb Label
    text('Duration', 65, 447);
    text('Decay', 205, 447);
    text('Dry/Wet', 70, 680);
    text('Output Volume', 185,680);

    // Waveshaper Distortion Label
    text('Distortion Amount', 315, 514);
    text('Oversample', 470,514);
    text('Dry/Wet', 345, 680);
    text('Output Volume', 465, 680);
}

function guiConfiguration() {
    ///// Sliders /////
    // Master Volume    
    masterVol = createSlider(0, 100, 50, 0.01);
    masterVol.position(735, 120);

    // Lowpass Filter
    cutoffFreq = createSlider(20, 20000, 5000, 0.01);
    cutoffFreq.position(20, 120);

    resSlider = createSlider(0, 50, 10, 0.1);
    resSlider.position(160, 120);

    dryWetLowpass = createSlider(0, 1, 0.5, 0.1);
    dryWetLowpass.position(25, 225);
    dryWetLowpass.style("transform", "rotate(270deg)");
    
    ouputVolLowpass = createSlider(0, 1, 0.5, 0.1);
    ouputVolLowpass.position(160, 225);
    ouputVolLowpass.style("transform", "rotate(270deg)");

    // Delay
    dryWetDelay = createSlider(0, 1, 0.5, 0.01);
    dryWetDelay.position(585, 550);
    dryWetDelay.style("transform", "rotate(270deg)");
    dryWetDelay.input(() => {
        delayEffect.drywet(dryWetDelay.value());
    });

    // Dynamic Compressor
    attackSlider = createSlider(0, 1, 0.5, 0.01);
    attackSlider.position(300, 120); // + 140 x val

    kneeSlider = createSlider(0, 40, 20, 0.01);
    kneeSlider.position(440, 120);

    releaseSlider = createSlider(0, 1, 0.5, 0.01);
    releaseSlider.position(580, 120);

    ratioSlider = createSlider(1, 20, 10, 0.01);
    ratioSlider.position(370, 200);

    thresholdSlider = createSlider(-100, 0, -50, 0.01);
    thresholdSlider.position(510, 200);

    dryWetDynamic = createSlider(0, 1, 0, 0.1);
    dryWetDynamic.position(370, 310);
    dryWetDynamic.style("transform", "rotate(270deg)");
    
    outputVolDynamic = createSlider(0, 1, 0.5, 0.1);
    outputVolDynamic.position(510, 310);
    outputVolDynamic.style("transform", "rotate(270deg)");

    // Reverb
    durationSlider = createSlider(0.1, 30, 10, 0.1);
    durationSlider.position(20, 410);

    decaySlider = createSlider(0, 2, 1, 0.01);
    decaySlider.position(160, 410);

    dryWetReverb = createSlider(0, 1, 0, 0);
    dryWetReverb.position(25, 590);
    dryWetReverb.style("transform", "rotate(270deg)");
    
    outputVolReverb = createSlider(0, 1, 0, 0);
    outputVolReverb.position(160, 590);
    outputVolReverb.style("transform", "rotate(270deg)");
    
    // Waveshaper Distortion
    distortionAmt = createSlider(0, 5, 1, 0.01);
    distortionAmt.position(300, 475);

    oversampleSlider = createSlider(0, 4, 0, 2);
    oversampleSlider.position(440, 475);

    dryWetDistortion = createSlider(0, 1, 0, 0);
    dryWetDistortion.position(300, 590);
    dryWetDistortion.style("transform", "rotate(270deg)");
    
    outputVolDistortion = createSlider(0, 1, 0.5, 0.1);
    outputVolDistortion.position(440, 590);
    outputVolDistortion.style("transform", "rotate(270deg)");

    ///// Buttons /////
    // Play Button
    playButton = createButton('PLAY');
    playButton.size(70, 50);
    playButton.position(70, 10);
    playButton.mousePressed(playSound);
    
    // Stop Button
    stopButton = createButton('STOP');
    stopButton.size(70, 50);
    stopButton.position(160, 10);
    stopButton.mousePressed(stopSound);
    
    // Pause Button
    pauseButton = createButton('PAUSE');
    pauseButton.size(70, 50);
    pauseButton.position(250, 10);
    pauseButton.mousePressed(pauseSound);
    
    // Skip-Start Button
    skipToStart = createButton('SKIP - START');
    skipToStart.size(70, 50);
    skipToStart.position(340, 10);
    skipToStart.mousePressed(skipToStartSound);
    
    // Skip-End Button
    skipToEnd = createButton('SKIP - END');
    skipToEnd.size(70, 50);
    skipToEnd.position(430, 10);
    skipToEnd.mousePressed(skipToEndSound);
    
    // Loop Button
    loopButton = createButton('LOOP');
    loopButton.size(70, 50);
    loopButton.position(520, 10);
    loopButton.mousePressed(loopSound);
    
    // Record Button
    record = createButton('RECORD');
    record.size(70, 50);
    record.position(610, 10);
    var c = color(204, 52, 52);
    record.style('background-color', c);
    record.mousePressed(recordSound);
    
    // Reverse Reverb Button
    reverseButton = createButton('REVERSE');
    reverseButton.size(80, 20);
    reverseButton.position(120, 490);
    reverseButton.mousePressed(reverseReverb);
}

// Reverse Reverb
function reverseReverb() {
    reverseFlag = !reverseFlag;
    reverbFilter.set(durationSlider.value(), decaySlider.value(), reverseFlag);
}

// Function to Change Filter Type
function filterChange() {
    val = filterSelect.value();

    if(val=='low-pass'){
        lowpassFilter.setType("lowpass");
    }
    else if(val=='high-pass') {
        lowpassFilter.setType("highpass");
    }
    else if(val=='bandpass'){
        lowpassFilter.setType("bandpass");
    }
}

// Function to Record Sound
function recordSound() {
    if (audioInput === 'Mic input') {
        if (!mic.enabled) {
            mic.start(); // Start the mic if it's not already enabled
        }
        if (state === 0) {
            console.log('Starting recording...');
            recorder.record(soundFileRec); // Start recording
            state++;
        } else if (state === 1) {
            console.log('Stopping recording...');
            recorder.stop(); // Stop recording
            save(soundFileRec, 'recorded_sound.wav'); // Save the recorded file
            state = 0;
        }
    } else {
        console.log('Recording is only available with Mic input.');
    }
}

///// Sound Button Functions /////
function loopSound() {
    soundFile.loop();
}

function playSound() {
    
    if(soundFile.isPlaying()){} 
    else {
        soundFile.play();
    }
}

function stopSound() {
    if(soundFile.isPlaying()){
        soundFile.stop();
    } 
}

function pauseSound() {
    if(soundFile.isPlaying()){
        soundFile.pause();
    }
}

function skipToStartSound() {
    if(soundFile.isPlaying()){
        soundFile.jump(0);
    } else {
        soundFile.play(0,1,1,1);
    }
}

function skipToEndSound() {
    if(soundFile.isPlaying()){
        soundFile.jump(soundFile.duration()-5);
    } else {
        soundFile.play(0,1,1,1);
    }
}
// self written code end
