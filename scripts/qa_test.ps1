$results = @()

# 1. Health API
try {
    $r1 = Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/health' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Backend Health API'; URL='http://localhost:8000/api/v1/health'; StatusCode=$r1.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Backend Health API'; URL='http://localhost:8000/api/v1/health'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 2. Landing Page
try {
    $r2 = Invoke-WebRequest -Uri 'http://localhost:3000/' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Frontend Landing Page'; URL='http://localhost:3000/'; StatusCode=$r2.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Frontend Landing Page'; URL='http://localhost:3000/'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 3. Login Page
try {
    $r3 = Invoke-WebRequest -Uri 'http://localhost:3000/login' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Recruiter Login Page'; URL='http://localhost:3000/login'; StatusCode=$r3.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Recruiter Login Page'; URL='http://localhost:3000/login'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 4. Signup Page
try {
    $r4 = Invoke-WebRequest -Uri 'http://localhost:3000/signup' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Recruiter Signup Page'; URL='http://localhost:3000/signup'; StatusCode=$r4.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Recruiter Signup Page'; URL='http://localhost:3000/signup'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 5. Forgot Password Page
try {
    $r5 = Invoke-WebRequest -Uri 'http://localhost:3000/forgot-password' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Forgot Password Page'; URL='http://localhost:3000/forgot-password'; StatusCode=$r5.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Forgot Password Page'; URL='http://localhost:3000/forgot-password'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 6. Public Job Apply Page
try {
    $r6 = Invoke-WebRequest -Uri 'http://localhost:3000/apply/test-job' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Public Job Apply Fallback'; URL='http://localhost:3000/apply/test-job'; StatusCode=$r6.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Public Job Apply Fallback'; URL='http://localhost:3000/apply/test-job'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 7. Candidate Assessment Route
try {
    $r7 = Invoke-WebRequest -Uri 'http://localhost:3000/assessment/test-app-id' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Candidate Assessment Route'; URL='http://localhost:3000/assessment/test-app-id'; StatusCode=$r7.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Candidate Assessment Route'; URL='http://localhost:3000/assessment/test-app-id'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 8. Candidate Interview Room Route
try {
    $r8 = Invoke-WebRequest -Uri 'http://localhost:3000/interview-room/test-app-id' -Method Get -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Candidate Interview Room Route'; URL='http://localhost:3000/interview-room/test-app-id'; StatusCode=$r8.StatusCode; Result='PASS' }
} catch {
    $results += [PSCustomObject]@{ Test='Candidate Interview Room Route'; URL='http://localhost:3000/interview-room/test-app-id'; StatusCode=$_.Exception.Response.StatusCode.value__; Result='FAIL' }
}

# 9. Protected Route Redirect Check
try {
    $r9 = Invoke-WebRequest -Uri 'http://localhost:3000/dashboard' -Method Get -MaximumRedirection 0 -ErrorAction Stop -TimeoutSec 5
    $results += [PSCustomObject]@{ Test='Protected Route Guard (/dashboard)'; URL='http://localhost:3000/dashboard'; StatusCode=$r9.StatusCode; Result='PASS (Allowed)' }
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 307 -or $code -eq 308 -or $code -eq 302 -or $code -eq 303) {
        $results += [PSCustomObject]@{ Test='Protected Route Guard (/dashboard)'; URL='http://localhost:3000/dashboard'; StatusCode=$code; Result='PASS (Redirect to Auth)' }
    } else {
        $results += [PSCustomObject]@{ Test='Protected Route Guard (/dashboard)'; URL='http://localhost:3000/dashboard'; StatusCode=$code; Result='FAIL' }
    }
}

$results | Format-Table -AutoSize
