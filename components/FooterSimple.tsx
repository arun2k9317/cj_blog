"use client";

import { useState, useEffect } from "react";
import { Anchor, Container, Group, Text, Box, Menu } from "@mantine/core";
import Link from "next/link";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
};

export function FooterSimple() {
  const [showCopyright, setShowCopyright] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [stories, setStories] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects-list")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects/stories:", error);
        setLoading(false);
      });
  }, []);

  const aboutLink = (
    <Anchor
      component={Link}
      href="/about"
      c="dimmed"
      size="sm"
      style={{
        textDecoration: "none",
        fontFamily: '"Crimson Text", "Ethos Nova", serif',
      }}
    >
      About
    </Anchor>
  );

  const projectsMenu = (
    <Menu
      trigger="hover"
      openDelay={100}
      closeDelay={200}
      styles={{
        dropdown: {
          fontFamily: '"Crimson Text", "Ethos Nova", serif',
        },
      }}
    >
      <Menu.Target>
        <Anchor
          c="dimmed"
          size="sm"
          style={{
            textDecoration: "none",
            fontFamily: '"Crimson Text", "Ethos Nova", serif',
            cursor: "pointer",
          }}
        >
          Projects
        </Anchor>
      </Menu.Target>
      <Menu.Dropdown>
        {loading ? (
          <Menu.Item disabled>Loading...</Menu.Item>
        ) : projects.length === 0 ? (
          <Menu.Item disabled>No projects</Menu.Item>
        ) : (
          projects.map((p) => (
            <Menu.Item
              key={p.id}
              component={Link}
              href={`/view/project/${p.slug || p.id}`}
              style={{
                fontFamily: '"Crimson Text", "Ethos Nova", serif',
              }}
            >
              {p.title || "Untitled Project"}
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );

  const storiesMenu = (
    <Menu
      trigger="hover"
      openDelay={100}
      closeDelay={200}
      styles={{
        dropdown: {
          fontFamily: '"Crimson Text", "Ethos Nova", serif',
        },
      }}
    >
      <Menu.Target>
        <Anchor
          c="dimmed"
          size="sm"
          style={{
            textDecoration: "none",
            fontFamily: '"Crimson Text", "Ethos Nova", serif',
            cursor: "pointer",
          }}
        >
          Stories
        </Anchor>
      </Menu.Target>
      <Menu.Dropdown>
        {loading ? (
          <Menu.Item disabled>Loading...</Menu.Item>
        ) : stories.length === 0 ? (
          <Menu.Item disabled>No stories</Menu.Item>
        ) : (
          stories.map((s) => (
            <Menu.Item
              key={s.id}
              component={Link}
              href={`/view/story/${s.slug || s.id}`}
              style={{
                fontFamily: '"Crimson Text", "Ethos Nova", serif',
              }}
            >
              {s.title || "Untitled Story"}
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );

  const contactLink = (
    <Anchor
      href="mailto:mail@nitinjamdar.in"
      c="dimmed"
      size="sm"
      style={{
        textDecoration: "none",
        fontFamily: '"Crimson Text", "Ethos Nova", serif',
      }}
    >
      Contact
    </Anchor>
  );

  return (
    <div className="footer-simple">
      <Container className="footer-simple-inner">
        <Box style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text
              size="xl"
              c="dimmed"
              fw={500}
              fz="32px"
              style={{ fontFamily: '"Crimson Text", "Ethos Nova", serif' }}
            >
              Nitin Jamdar
            </Text>
            <Text
              size="xl"
              c="dimmed"
              fw={500}
              fz="32px"
              style={{
                fontFamily: '"Crimson Text", "Ethos Nova", serif',
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setShowCopyright(!showCopyright)}
            >
              ©
            </Text>
          </Box>
          {showCopyright && (
            <Text
              size="sm"
              c="dimmed"
              style={{
                fontFamily: '"Crimson Text", "Ethos Nova", serif',
                paddingTop: "8px",
              }}
            >
              © {new Date().getFullYear()} Nitin Jamdar. All rights reserved.
              All photographs and content on this website are protected by
              copyright and may not be reproduced, distributed, or used without
              written permission from the photographer.
            </Text>
          )}
        </Box>
        <Group className="footer-simple-links" gap="md">
          {aboutLink}
          {projectsMenu}
          {storiesMenu}
          {contactLink}
        </Group>
      </Container>
    </div>
  );
}
