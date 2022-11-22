
var audioCtx;
var osc;
var lfo;
var gainNode;
var attack;
var decay;
var sustain;
var synthType;
var color = 0;

const timeMap = {
    "0" : 0.01,
    "1" : 0.1,
    "2" : 0.2,
    "3" : 0.4,
    "4" : 0.6,
    "5" : 0.8,
    "6" : 1,
    "7" : 2.5,
    "8" : 5,
    "9" : 7.5,
    "10" : 10.0,
}


// we start by defining some input (not training) data
TWINKLE_TWINKLE = {
    notes: [
      {pitch: 60, startTime: 0.0, endTime: 0.5},
      {pitch: 60, startTime: 0.5, endTime: 1.0},
      {pitch: 67, startTime: 1.0, endTime: 1.5},
      {pitch: 67, startTime: 1.5, endTime: 2.0},
      {pitch: 69, startTime: 2.0, endTime: 2.5},
      {pitch: 69, startTime: 2.5, endTime: 3.0},
      {pitch: 67, startTime: 3.0, endTime: 4.0},
      {pitch: 65, startTime: 4.0, endTime: 4.5},
      {pitch: 65, startTime: 4.5, endTime: 5.0},
      {pitch: 64, startTime: 5.0, endTime: 5.5},
      {pitch: 64, startTime: 5.5, endTime: 6.0},
      {pitch: 62, startTime: 6.0, endTime: 6.5},
      {pitch: 62, startTime: 6.5, endTime: 7.0},
      {pitch: 60, startTime: 7.0, endTime: 8.0},  
    ],
    totalTime: 8
  };

function midiToFreq(m) {
    return Math.pow(2, (m - 69) / 12) * 440;
}

//to play notes that are generated from .continueSequence
//we need to unquantize, then loop through the list of notes
function playNotes(noteList) {
    noteList = mm.sequences.unquantizeSequence(noteList)
    console.log(noteList.notes)
    noteList.notes.forEach(note => {
        playNote(note);
    });
}

function playNote(note) {
    offset = 1 //it takes a bit of time to queue all these events

    if (synthType == "add"){
        additive(note)
    }
    else if (synthType == "am"){
        am(note)
    }else{ //default to fm, why? idk, vibes
        fm(note)
    }

}


function genNotes() {
    //establish synthesis type and envelope shape
    synthType = document.getElementById('synthesis').value;
    attack = timeMap[document.getElementById('attack').value];
    decay = timeMap[document.getElementById('decay').value];
    sustain = document.getElementById('sustain').value;


    //load a pre-trained RNN model
    music_rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
    music_rnn.initialize();
    
    //the RNN model expects quantized sequences
    const qns = mm.sequences.quantizeNoteSequence(TWINKLE_TWINKLE, 4);
    
    //and has some parameters we can tune
    rnn_steps = 40; //including the input sequence length, how many more quantized steps (this is diff than how many notes) to generate 
    rnn_temperature = 1.1; //the higher the temperature, the more random (and less like the input) your sequence will be
    
    // we continue the sequence, which will take some time (thus is run async)
    // "then" when the async continueSequence is done, we play the notes
    music_rnn
        .continueSequence(qns, rnn_steps, rnn_temperature)
        .then((sample) => playNotes(mm.sequences.concatenate([qns,sample])));

}



const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {
    //instantiate and connect oscillators and gain
    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    osc = audioCtx.createOscillator();
    osc.type = document.getElementById('waveform1').value; //choose your favorite waveform
    gainNode = audioCtx.createGain();
    lfo = audioCtx.createOscillator();
    lfo.frequency.value = document.getElementById('lfoFreq').value / 10;
    lfo.type = document.getElementById('lfowaveform').value;
    lfo.connect(gainNode);
    lfo.start();
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start()
    gainNode.gain.value = 0;

    genNotes();

}, false);




function additive(note){
    var part2 = audioCtx.createOscillator();
    var part3 = audioCtx.createOscillator();

    part2.frequency.value = osc.frequency.value * document.getElementById('frequency2').value;
    part3.frequency.value = osc.frequency.value * document.getElementById('frequency3').value;

    part2.type = document.getElementById('waveform2').value;
    part3.type = document.getElementById('waveform3').value;

    part2.connect(gainNode);
    part2.connect(gainNode);
    
    part2.start()
    part3.start()

    gainNode.gain.setTargetAtTime(0.8/3, note.startTime+1, attack) //envelope attack
    osc.frequency.setTargetAtTime(midiToFreq(note.pitch), note.startTime+1, 0.001)
    gainNode.gain.setTargetAtTime((0.8/3)*sustain, note.startTime+1 + attack, decay)
    gainNode.gain.setTargetAtTime(0, note.endTime+1-0.05, 0.01)


}


function am(note){
    var mf = audioCtx.createOscillator()
    mf.frequency.value = 101 //why not
    mf.type = document.getElementById('waveform2').value;

    const mod = audioCtx.createGain()
    const depth = audioCtx.createGain()

    depth.gain.value = 0.5
    mod.gain.value = 1.0 - depth.gain.value

    mf.connect(depth).connect(mod.gain);
    osc.connect(mod);
    mod.connect(gainNode);
    mf.start()

    gainNode.gain.setTargetAtTime(0.8/2, note.startTime+1, attack) //envelope attack
    osc.frequency.setTargetAtTime(midiToFreq(note.pitch), note.startTime+1, 0.001)
    gainNode.gain.setTargetAtTime((0.8/2)*sustain, note.startTime+1 + attack, decay)
    gainNode.gain.setTargetAtTime(0, note.endTime+1-0.05, 0.01)


    
}

function fm(note){
   var mf = audioCtx.createOscillator()
    mf.frequency.value = osc.frequency.value * document.getElementById('frequency2').value
    mf.type = document.getElementById('waveform2').value;

    var mod = audioCtx.createGain()
    mod.gain.value = 101

    mf.connect(mod);
    mod.connect(osc.frequency);
    
    osc.connect(gainNode);

    mf.start()
    
    gainNode.gain.setTargetAtTime(0.8/2, note.startTime+1, attack) //envelope attack
    osc.frequency.setTargetAtTime(midiToFreq(note.pitch), note.startTime+1, 0.001)
    gainNode.gain.setTargetAtTime((0.8/2)*sustain, note.startTime+1 + attack, decay)
    gainNode.gain.setTargetAtTime(0, note.endTime+1-0.05, 0.01)


}
