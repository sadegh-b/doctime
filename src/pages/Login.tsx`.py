# حذف فایل‌های مشکل‌دار با اسم دقیق (با LiteralPath)
Remove-Item -LiteralPath "C:\PythonProject\PythonProject\doctime-frontend\src\pages\`LoginPage.tsx`.py" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "C:\PythonProject\PythonProject\doctime-frontend\src\pages\`Login.tsx`.py" -Force -ErrorAction SilentlyContinue

# ساخت LoginPage.tsx واقعی
$content = @'
import React from 'react';

const LoginPage = () => (
  <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, textAlign: 'right' }} dir="rtl">
    <h1>ورود به حساب کاربری</h1>
    <form>
      <label>ایمیل</label><br/>
      <input type="email" style={{ width: '100%' }} /><br/><br/>
      <label>رمز عبور</label><br/>
      <input type="password" style={{ width: '100%' }} /><br/><br/>
      <button type="submit" style={{ padding: '10px 20px' }}>ورود</button>
    </form>
  </div>
);

export default LoginPage;
'@
[System.IO.File]::WriteAllText("C:\PythonProject\PythonProject\doctime-frontend\src\pages\LoginPage.tsx", $content, [System.Text.UTF8Encoding]::new($false))

# تأیید
Get-ChildItem "C:\PythonProject\PythonProject\doctime-frontend\src\pages" | Format-Table Name, Length
