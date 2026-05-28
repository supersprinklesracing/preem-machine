'use client';

import { Anchor, Card, Stack, Title } from '@mantine/core';
import Script from 'next/script';
import React from 'react';

function isStravaRoute(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'www.strava.com' &&
      parsedUrl.pathname.includes('/routes/')
    );
  } catch {
    return false;
  }
}

function getStravaRouteId(url: string): string | undefined {
  const match = url.match(/routes\/(\d+)/);
  return match ? match[1] : undefined;
}

function isRideWithGpsRoute(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'ridewithgps.com' &&
      parsedUrl.pathname.includes('/routes/')
    );
  } catch {
    return false;
  }
}

function getRideWithGpsRouteId(url: string): string | undefined {
  const match = url.match(/routes\/(\d+)/);
  return match ? match[1] : undefined;
}

/**
 * Renders a course link, embedding it if it's a Strava or Ride with GPS route.
 * Garmin Connect links are not supported as they do not offer an embeddable widget.
 */
export function CourseLink({ courseLink }: { courseLink?: string }) {
  if (!courseLink) {
    return null;
  }

  const isStrava = isStravaRoute(courseLink);
  const isRwgps = isRideWithGpsRoute(courseLink);

  return (
    <Card withBorder>
      {isStrava && (
        <Script
          src="https://strava-embeds.com/embed.js"
          strategy="afterInteractive"
        />
      )}
      <Stack>
        <Title order={2}>Course</Title>
        {isRwgps ? (
          <iframe
            title="Ride with GPS course"
            data-testid="ride-with-gps-embed"
            src={`https://rwgps-embeds.com/embeds?type=route&id=${getRideWithGpsRouteId(courseLink)}&sampleGraph=true`}
            style={{
              width: '100%',
              height: '500px',
              border: 'none',
            }}
          ></iframe>
        ) : isStrava ? (
          <div
            data-testid="strava-embed"
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
