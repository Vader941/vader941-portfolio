<?php


// ---------------- CONFIG ----------------
$recipientEmail = "nable@vader941.dev";   // where YOU want to receive messages
$fromAddress    = "nable@vader941.dev";     // use a domain-based address for IONOS
$subjectPrefix  = "[Portfolio Contact] ";
$successMessage = "Thanks for reaching out! I’ll get back to you as soon as I can.";

// Reasons shared by the form, validation, and email formatting.
$topicLabels = [
    "job" => "Job opportunity",
    "project" => "Project inquiry",
    "networking" => "Networking",
    "other" => "Other"
];

// ---------------- STATE -----------------
$formSubmitted = ($_SERVER["REQUEST_METHOD"] === "POST");
$formErrors    = [];
$formSuccess   = false;

// Default values for repopulating form
$name = $email = $subject = $message = $topic = "";

// ---------------- VALIDATION + MAIL -----
if ($formSubmitted) {
    // Honeypot anti-spam (hidden field should stay empty)
    if (!empty($_POST["website"] ?? "")) {
        $formErrors[] = "Invalid submission.";
    }

    $name    = trim($_POST["name"] ?? "");
    $email   = trim($_POST["email"] ?? "");
    $subject = trim($_POST["subject"] ?? "");
    $message = trim($_POST["message"] ?? "");
    $topic   = trim($_POST["topic"] ?? "");

    if ($name === "") {
        $formErrors[] = "Please enter your name.";
    }

    if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $formErrors[] = "Please enter a valid email address.";
    }

    if ($topic === "") {
        $formErrors[] = "Please select a reason for contacting me.";
    } elseif (!array_key_exists($topic, $topicLabels)) {
        $formErrors[] = "Please select a valid reason for contacting me.";
    }

    if ($message === "") {
        $formErrors[] = "Please enter a message.";
    }

    if ($subject === "") {
        $subject = "Portfolio Contact Form";
    }

    if (empty($formErrors)) {
        $emailSubject = $subjectPrefix . $subject;

        $bodyLines = [
            "Name: {$name}",
            "Email: {$email}",
            "Reason for contacting: " . $topicLabels[$topic],
            "",
            "Message:",
            $message
        ];
        $emailBody = implode("\n", $bodyLines);

        $headers  = "From: Portfolio Site <{$fromAddress}>\r\n";
        $headers .= "Reply-To: {$email}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $sent = @mail($recipientEmail, $emailSubject, $emailBody, $headers);

        if ($sent) {
            $formSuccess = true;
            $name = $email = $subject = $message = $topic = "";
        } else {
            $formErrors[] = "There was a problem sending your message. Please try again later.";
        }
    }
}
?>

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Contact — Nathan Able</title>
  <meta name="description" content="Contact Nathan Able about business systems analysis or implementation opportunities, his work, networking, or a practical software problem by email or the contact form.">
  <link rel="icon" type="image/x-icon" href="images/favicon.ico">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/contact.css">
</head>
<body>
  <header class="site-header">
    <nav class="site-nav" aria-label="Primary">
      <button class="menu-toggle" aria-controls="nav-links" aria-expanded="false">Menu</button>
      <ul id="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="projects.html">Selected Work</a></li>
        <li><a href="tech.html">Tech</a></li>
        <li><a href="hobbies.html">Hobbies</a></li>
        <li><a href="resume.html">Resume</a></li>
        <li><a href="contact.php" aria-current="page">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main id="main" class="contact-main">
    <!-- Hero -->
    <section class="contact-hero">
      <div class="container">
        <h1 class="contact-title">Get in Touch</h1>
        <p class="contact-tagline">If you have an opportunity in business systems analysis or implementation, I’d like to hear about it. I’m also happy to talk about my work, connect with others in the field, or discuss a practical software problem. You can email me directly or use the form below.</p>
      </div>
    </section>

    <!-- Contact info -->
    <section class="contact-info-section">
      <div class="container contact-info">
        <div class="contact-card">
          <h2>Email</h2>
          <p><a href="mailto:able.nathan.t@gmail.com">able.nathan.t@gmail.com</a></p>
        </div>

        <div class="contact-card">
          <h2>LinkedIn</h2>
          <p><a href="https://linkedin.com/in/nathan-able" target="_blank" rel="noopener">linkedin.com/in/nathan-able</a></p>
        </div>

        <div class="contact-card">
          <h2>GitHub</h2>
          <p><a href="https://github.com/Vader941" target="_blank" rel="noopener">github.com/Vader941</a></p>
        </div>
      </div>
    </section>

    <!-- Form -->
    <section>
      <div class="contact-wrapper">

        <?php if ($formSubmitted): ?>
          <?php if ($formSuccess): ?>
            <p class="contact-feedback contact-feedback--success">
              <?php echo htmlspecialchars($successMessage); ?>
            </p>
          <?php else: ?>
            <div class="contact-feedback contact-feedback--error" role="alert">
              <strong>There were problems with your submission:</strong>
              <ul>
                <?php foreach ($formErrors as $error): ?>
                  <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
          <?php endif; ?>
        <?php endif; ?>

        <form
          class="contact-form"
          id="contact-form"
          action="contact.php"
          method="POST"
          autocomplete="off"
          novalidate
        >
          <div class="form-field">
            <label for="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              required
              value="<?php echo htmlspecialchars($name); ?>"
            >
          </div>

          <div class="form-field">
            <label for="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              required
              value="<?php echo htmlspecialchars($email); ?>"
            >
          </div>

          <div class="form-field">
            <label for="topic">Reason for contacting *</label>
            <select id="topic" name="topic" required>
              <option value="">Select one…</option>
              <?php foreach ($topicLabels as $value => $label): ?>
                <option value="<?php echo htmlspecialchars($value); ?>" <?php echo $topic === $value ? "selected" : ""; ?>><?php echo htmlspecialchars($label); ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="form-field">
            <label for="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Subject (optional)"
              value="<?php echo htmlspecialchars($subject); ?>"
            >
          </div>

          <div class="form-field">
            <label for="message">Message *</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Your message"
              required
            ><?php echo htmlspecialchars($message); ?></textarea>
          </div>

          <!-- Honeypot field (hidden from humans) -->
          <div class="form-field honeypot" aria-hidden="true">
            <label for="website">Website</label>
            <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit" class="contact-button">
            Send Message
          </button>

          <p class="contact-note">
            Fields marked with * are required. I typically respond within one business day.
          </p>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>© <span id="year"></span> Nathan Able.</p>
    </div>
  </footer>

  <script src="js/site.js"></script>
  <script src="js/contact.js"></script>
</body>
</html>
