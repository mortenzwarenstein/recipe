<#ftl encoding="UTF-8">
<!DOCTYPE html>
<html lang="${locale!'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in — Recipe</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M6 18 C6 30 34 30 34 18" stroke="#b85830" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          <line x1="6" y1="18" x2="6" y2="22" stroke="#b85830" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="34" y1="18" x2="34" y2="22" stroke="#b85830" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M12 28 Q20 32 28 28" stroke="#b85830" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.5"/>
          <path d="M15 13 Q14 10 15 7" stroke="#b85830" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/>
          <path d="M20 12 Q19 8 20 5" stroke="#b85830" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/>
          <path d="M25 13 Q24 10 25 7" stroke="#b85830" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/>
        </svg>
        <h1><em>Recipe</em></h1>
      </div>

      <#if message?has_content>
        <div class="alert alert-${message.type}">
          ${message.summary?no_esc}
        </div>
      </#if>

      <form id="kc-form-login" action="${url.loginAction}" method="post">

        <#if !usernameHidden??>
          <div class="field">
            <label for="username">
              <#if !realm.loginWithEmailAllowed>Username
              <#elseif !realm.registrationEmailAsUsername>Username or email
              <#else>Email
              </#if>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value="${(login.username!'')}"
              autocomplete="username"
              autofocus
            >
          </div>
        </#if>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
          >
        </div>

        <#if realm.rememberMe && !usernameHidden??>
          <label class="remember-me">
            <input type="checkbox" name="rememberMe" <#if login.rememberMe??>checked</#if>>
            <span>Remember me</span>
          </label>
        </#if>

        <input type="hidden" name="credentialId" value="${(auth.selectedCredential!'')}" />

        <button type="submit" class="btn-submit" name="login">Sign in</button>

        <#if realm.resetPasswordAllowed>
          <a href="${url.loginResetCredentialsUrl}" class="link-forgot">Forgot password?</a>
        </#if>

      </form>
    </div>
  </div>
</body>
</html>
