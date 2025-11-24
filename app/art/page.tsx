import Image from "next/image";
import Link from "next/link";
import { Container, Stack, Title, Text, Box } from "@mantine/core";

export default function Art404() {
  return (
    <Container
      component="main"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      p="xl"
    >
      <Stack align="center" gap="md" style={{ textAlign: "center" }}>
        <Box mb="md">
          <Image
            src="/logo.png"
            alt="Nitin Jamdar"
            width={120}
            height={120}
            style={{ margin: "0 auto" }}
          />
        </Box>
        <Title
          order={1}
          size="xl"
          fw={700}
          tt="uppercase"
          style={{ letterSpacing: "0.1em" }}
          c="var(--gray-900)"
        >
          404 — Art page not found
        </Title>
        <Text size="lg" c="var(--gray-600)" mt="xs">
          The page you are looking for does not exist.
        </Text>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            fontSize: "13px",
            textDecoration: "underline",
            color: "var(--gray-900)",
          }}
        >
          Go back home
        </Link>
      </Stack>
    </Container>
  );
}
