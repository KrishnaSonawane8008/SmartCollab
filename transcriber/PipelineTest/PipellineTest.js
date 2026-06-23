const wav = require('wav');

function writeChunksToWav(allChunks, filePath, sampleRate = 16000) {
  const fileWriter = new wav.FileWriter(
    `./PipelineTest/Output/${filePath}`,
    {
      channels: 1,
      sampleRate,
      bitDepth: 16
    }
  );

  if (allChunks.size === 0) {
    fileWriter.end();
    return;
  }

  // Ensure chunk numbers are written in order
  const chunkNumbers = [...allChunks.keys()].sort((a, b) => a - b);

  for (const chunkNumber of chunkNumbers) {
    const chunks = allChunks.get(chunkNumber);

    if (!chunks || chunks.length === 0) {
      continue;
    }

    const chunkSize = chunks[0].length;
    const mixed = Buffer.alloc(chunkSize);
    const samples = chunkSize / 2;

    // Mix sample-by-sample
    for (let s = 0; s < samples; s++) {
      let sum = 0;

      for (const chunk of chunks) {
        sum += chunk.readInt16LE(s * 2);
      }

      // Average to avoid clipping
      let sample = Math.round(sum / chunks.length);

      if (sample > 32767) sample = 32767;
      if (sample < -32768) sample = -32768;

      mixed.writeInt16LE(sample, s * 2);
    }

    fileWriter.write(mixed);
  }

  fileWriter.end();
}

module.exports = { writeChunksToWav };