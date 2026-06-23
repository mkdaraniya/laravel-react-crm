<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    private const BLOCKED_PATTERNS = [
        '/<script\b[^>]*>(.*?)<\/script>/is',
        '/javascript\s*:/is',
        '/on\w+\s*=\s*["\']?[^"\'>]*["\']?/is',
        '/document\.\w+/is',
        '/window\.\w+/is',
        '/alert\s*\(/is',
        '/eval\s*\(/is',
        '/<[^>]*>[\s\S]*?<\/[^>]*>/is',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET')) {
            return $next($request);
        }

        $input = $request->all();
        $sanitized = $this->sanitize($input);
        $request->replace($sanitized);

        return $next($request);
    }

    private function sanitize(mixed $value): mixed
    {
        if (is_string($value)) {
            $value = $this->removeBlockedPatterns($value);
            $value = strip_tags($value);
            return trim($value);
        }

        if (is_array($value)) {
            return array_map([$this, 'sanitize'], $value);
        }

        return $value;
    }

    private function removeBlockedPatterns(string $value): string
    {
        foreach (self::BLOCKED_PATTERNS as $pattern) {
            $value = preg_replace($pattern, '', $value);
        }
        return $value;
    }
}
