<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_preflight_from_vercel_preview_url_is_allowed(): void
    {
        $origin = 'https://korean-topik-app-git-fix-preview-abc123.vercel.app';

        $res = $this->call(
            'OPTIONS',
            '/api/v1/vocabularies',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => $origin,
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization',
            ]
        );

        $res->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    public function test_preflight_from_vercel_production_url_is_allowed(): void
    {
        $origin = 'https://korean-topik-app.vercel.app';

        $res = $this->call(
            'OPTIONS',
            '/api/v1/vocabularies',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => $origin,
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization',
            ]
        );

        $res->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    public function test_preflight_from_localhost_is_allowed(): void
    {
        $origin = 'http://localhost:3000';

        $res = $this->call(
            'OPTIONS',
            '/api/v1/vocabularies',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => $origin,
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization',
            ]
        );

        $res->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    public function test_preflight_from_disallowed_origin_is_not_allowed(): void
    {
        $origin = 'https://evil.example.com';

        $res = $this->call(
            'OPTIONS',
            '/api/v1/vocabularies',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => $origin,
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization',
            ]
        );

        $this->assertNotEquals($origin, $res->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_http_is_not_allowed_even_with_vercel_hostname(): void
    {
        $origin = 'http://korean-topik-app.vercel.app';

        $res = $this->call(
            'OPTIONS',
            '/api/v1/vocabularies',
            [],
            [],
            [],
            [
                'HTTP_ORIGIN' => $origin,
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization',
            ]
        );

        $this->assertNotEquals($origin, $res->headers->get('Access-Control-Allow-Origin'));
    }
}
