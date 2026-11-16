const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const sections = document.querySelectorAll("main section[id]");
const navItems = document.querySelectorAll(".nav-links a");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navItems.forEach((item) => {
        item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach((section) => observer.observe(section));

const projectGrid = document.getElementById("projectGrid");
const previewMarks = {
  dashboard: "▦",
  excel: "X",
  payroll: "P",
  website: "</>",
  image: "▧",
};

function safeProjectLink(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim(), window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? value.trim() : null;
  } catch {
    return null;
  }
}

function createProjectLink(label, value) {
  const href = safeProjectLink(value);
  if (!href) return null;

  const link = document.createElement("a");
  link.className = "text-link";
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const previewType = Object.hasOwn(previewMarks, project.preview_type)
    ? project.preview_type
    : "website";
  const preview = document.createElement("div");
  preview.className = `project-preview ${previewType}-preview`;

  const placeholder = document.createElement("span");
  placeholder.className = "project-preview-mark";
  placeholder.setAttribute("aria-hidden", "true");
  placeholder.textContent = previewMarks[previewType];
  preview.append(placeholder);

  if (typeof project.image === "string" && project.image.trim()) {
    const image = document.createElement("img");
    image.className = "project-image";
    image.src = project.image.trim();
    image.alt = `${project.title || "Project"} preview`;
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    preview.append(image);
  }

  const info = document.createElement("div");
  info.className = "project-info";

  if (typeof project.category === "string" && project.category.trim()) {
    const category = document.createElement("span");
    category.className = "tag";
    category.textContent = project.category.trim();
    info.append(category);
  }

  const title = document.createElement("h3");
  title.textContent = typeof project.title === "string" ? project.title : "Untitled project";
  info.append(title);

  if (typeof project.description === "string" && project.description.trim()) {
    const description = document.createElement("p");
    description.textContent = project.description.trim();
    info.append(description);
  }

  const links = document.createElement("div");
  links.className = "project-links";
  const demoLink = createProjectLink("Live Demo ↗", project.demo_url);
  const sourceLink = createProjectLink("Source Code ↗", project.source_url);
  if (demoLink) links.append(demoLink);
  if (sourceLink) links.append(sourceLink);
  if (links.childElementCount) info.append(links);

  card.append(preview, info);
  return card;
}

async function loadProjects() {
  if (!projectGrid) return;

  try {
    const response = await fetch("content/projects.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Project data request failed (${response.status})`);

    const data = await response.json();
    if (!Array.isArray(data.projects)) throw new Error("Project data must contain a projects list");

    projectGrid.replaceChildren();
    if (data.projects.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "projects-status";
      emptyState.textContent = "New work is on the way. In the meantime, let's talk about your project.";
      const contactLink = document.createElement("a");
      contactLink.className = "text-link";
      contactLink.href = "#contact";
      contactLink.textContent = "Get in touch ↗";
      emptyState.append(contactLink);
      projectGrid.append(emptyState);
      return;
    }

    data.projects.forEach((project) => {
      if (project && typeof project === "object") projectGrid.append(createProjectCard(project));
    });
  } catch (error) {
    console.error("Unable to load CMS projects:", error);
    const errorState = document.createElement("p");
    errorState.className = "projects-status projects-error";
    errorState.textContent = "Projects could not be loaded. Please try again later.";
    projectGrid.replaceChildren(errorState);
  }
}

loadProjects();
