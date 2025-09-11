'use client';

import { Anchor, Card, Stack, Title } from '@mantine/core';
import { useEffect } from 'react';

function isStravaRoute(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'www.strava.com' && parsedUrl.pathname.includes('/routes/');
  } catch {
    return false;
  }
}

function getStravaRouteId(url: string): string | undefined {
  const match = url.match(/routes\/(\d+)/);
  return match ? match[1] : undefined;
}

export default function CourseLink({ courseLink }: { courseLink?: string }) {
  useEffect(() => {
    if (isStravaRoute(courseLink)) {
      const script = document.createElement('script');
      script.src = 'https://strava-embeds.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
    return () => {};
  }, [courseLink]);

  if (!courseLink) {
    return null;
  }

  return (
    <Card withBorder>
      <Stack>
        <Title order={2}>Course</Title>
        {isStravaRoute(courseLink) ? (
          <div
            className="strava-embed-placeholder"
            data-embed-type="route"
            data-embed-id={getStravaRouteId(courseLink)}
            data-style="standard"
            data-slippy="true"
            style={{ minHeight: '450px' }}
          ></div>
        ) : (
          <Anchor href={courseLink} target="_blank" rel="noopener noreferrer">
            {courseLink}
          </Anchor>
        )}
      </Stack>
    </Card>
  );
}
