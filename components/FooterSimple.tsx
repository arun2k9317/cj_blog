"use client";

import { useState } from "react";
import { Anchor, Container, Group, Text, Box } from "@mantine/core";
import Link from "next/link";

const links = [
  { link: "/about", label: "About" },
  { link: "/projects", label: "Projects" },
  { link: "/stories", label: "Stories" },
  { link: "mailto:mail@nitinjamdar.in", label: "Contact" },
];

export function FooterSimple() {
  const [showCopyright, setShowCopyright] = useState(false);
  const items = links.map((link) => {
    if (link.link.startsWith("mailto:")) {
      return (
        <Anchor
          key={link.label}
          href={link.link}
          c="dimmed"
          size="sm"
          style={{
            textDecoration: "none",
            fontFamily: '"Crimson Text", "Ethos Nova", serif',
          }}
        >
          {link.label}
        </Anchor>
      );
    }
    return (
      <Anchor
        key={link.label}
        component={Link}
        href={link.link}
        c="dimmed"
        size="sm"
        style={{
          textDecoration: "none",
          fontFamily: '"Crimson Text", "Ethos Nova", serif',
        }}
      >
        {link.label}
      </Anchor>
    );
  });

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
          {items}
        </Group>
      </Container>
    </div>
  );
}
