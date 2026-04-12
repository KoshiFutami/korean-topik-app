<?php

declare(strict_types=1);

namespace App\Services\Vocabulary;

use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;
use Google\Cloud\TextToSpeech\V1\AudioConfig;
use Google\Cloud\TextToSpeech\V1\AudioEncoding;
use Google\Cloud\TextToSpeech\V1\Client\TextToSpeechClient;
use Google\Cloud\TextToSpeech\V1\SynthesisInput;
use Google\Cloud\TextToSpeech\V1\SynthesizeSpeechRequest;
use Google\Cloud\TextToSpeech\V1\VoiceSelectionParams;

final class GoogleCloudVocabularySpeechSynthesizer implements VocabularySpeechSynthesizerInterface
{
    public function __construct(
        private readonly TextToSpeechClient $client,
        private readonly string $languageCode,
        private readonly string $voiceName,
    ) {}

    public function synthesizeKoreanToMp3(string $text): string
    {
        $input = (new SynthesisInput)->setText($text);
        $voice = (new VoiceSelectionParams)
            ->setLanguageCode($this->languageCode)
            ->setName($this->voiceName);
        $audioConfig = (new AudioConfig)
            ->setAudioEncoding(AudioEncoding::MP3)
            ->setSpeakingRate(1.0);

        $request = SynthesizeSpeechRequest::build($input, $voice, $audioConfig);
        $response = $this->client->synthesizeSpeech($request);
        $content = $response->getAudioContent();

        return $content !== '' ? $content : '';
    }
}
