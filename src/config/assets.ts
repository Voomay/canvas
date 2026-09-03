/**
 * Central Asset Registry & Paths Configuration
 * 
 * Replace these placeholder paths with your own PNG artwork, sprite sheets,
 * and audio files without needing to modify the core game logic!
 */

export interface AssetManifest {
  backgrounds: {
    sky: string;
    clouds: string;
    houses: string;
    trees: string;
  };
  roads: {
    clean: string;
    damaged: string;
  };
  players: {
    da: {
      spriteSheet?: string;
      idle: string;
      run: string;
      jump: string;
      hit: string;
      talk: string;
    };
    anc: {
      spriteSheet?: string;
      idle: string;
      run: string;
      jump: string;
      hit: string;
      talk: string;
    };
    pa: {
      spriteSheet?: string;
      idle: string;
      run: string;
      jump: string;
      hit: string;
      talk: string;
    };
  };
  residents: {
    diverseIdle: string[];
    reactions: {
      happy: string;
      doubtful: string;
      frustrated: string;
    };
  };
  obstacles: {
    potholeSmall: string;
    potholeLarge: string;
    potholeWater: string;
    rubbishBag: string;
    brokenDrain: string;
    openManhole: string;
    leakingPipe: string;
    fallenPoster: string;
  };
  ui: {
    buttons: {
      primary: string;
      secondary: string;
      action: string;
    };
    icons: {
      vote: string;
      trust: string;
      timer: string;
      alert: string;
      thumbsUp: string;
      foldedArms: string;
      frustration: string;
    };
    dialogue: {
      box: string;
      bubble: string;
    };
  };
  audio: {
    music: {
      menu: string;
      gameplay: string;
      victory: string;
    };
    effects: {
      footstep: string;
      jump: string;
      hit: string;
      residentAlert: string;
      votePositive: string;
      voteDoubtful: string;
      voteNegative: string;
      buttonClick: string;
    };
  };
}

export const ASSET_CONFIG: AssetManifest = {
  backgrounds: {
    sky: '/assets/backgrounds/sky/sky_day.png',
    clouds: '/assets/backgrounds/clouds/clouds.png',
    houses: '/assets/backgrounds/houses/suburb_houses.png',
    trees: '/assets/backgrounds/houses/trees.png'
  },
  roads: {
    clean: '/assets/roads/clean/pavement_road.png',
    damaged: '/assets/roads/damaged/damaged_road.png'
  },
  players: {
    da: {
      idle: '/assets/players/da/da_idle.png',
      run: '/assets/players/da/da_run.png',
      jump: '/assets/players/da/da_jump.png',
      hit: '/assets/players/da/da_hit.png',
      talk: '/assets/players/da/da_talk.png'
    },
    anc: {
      idle: '/assets/players/anc/anc_idle.png',
      run: '/assets/players/anc/anc_run.png',
      jump: '/assets/players/anc/anc_jump.png',
      hit: '/assets/players/anc/anc_hit.png',
      talk: '/assets/players/anc/anc_talk.png'
    },
    pa: {
      idle: '/assets/players/pa/pa_idle.png',
      run: '/assets/players/pa/pa_run.png',
      jump: '/assets/players/pa/pa_jump.png',
      hit: '/assets/players/pa/pa_hit.png',
      talk: '/assets/players/pa/pa_talk.png'
    }
  },
  residents: {
    diverseIdle: [
      '/assets/residents/idle/resident_1.png',
      '/assets/residents/idle/resident_2.png',
      '/assets/residents/idle/resident_3.png',
      '/assets/residents/idle/resident_4.png',
      '/assets/residents/idle/resident_5.png',
      '/assets/residents/idle/resident_6.png',
      '/assets/residents/idle/resident_7.png',
      '/assets/residents/idle/resident_8.png',
      '/assets/residents/idle/resident_9.png',
      '/assets/residents/idle/resident_10.png',
      '/assets/residents/idle/resident_11.png',
      '/assets/residents/idle/resident_12.png'
    ],
    reactions: {
      happy: '/assets/residents/happy/happy_reaction.png',
      doubtful: '/assets/residents/doubtful/doubtful_reaction.png',
      frustrated: '/assets/residents/frustrated/frustrated_reaction.png'
    }
  },
  obstacles: {
    potholeSmall: '/assets/obstacles/potholes/pothole_small.png',
    potholeLarge: '/assets/obstacles/potholes/pothole_large.png',
    potholeWater: '/assets/obstacles/potholes/pothole_water.png',
    rubbishBag: '/assets/obstacles/rubbish/rubbish_bag.png',
    brokenDrain: '/assets/obstacles/potholes/broken_drain.png',
    openManhole: '/assets/obstacles/potholes/open_manhole.png',
    leakingPipe: '/assets/obstacles/pipes/leaking_pipe.png',
    fallenPoster: '/assets/obstacles/rubbish/fallen_poster.png'
  },
  ui: {
    buttons: {
      primary: '/assets/ui/buttons/btn_primary.png',
      secondary: '/assets/ui/buttons/btn_secondary.png',
      action: '/assets/ui/buttons/btn_action.png'
    },
    icons: {
      vote: '/assets/ui/icons/icon_vote.png',
      trust: '/assets/ui/icons/icon_trust.png',
      timer: '/assets/ui/icons/icon_timer.png',
      alert: '/assets/ui/icons/icon_alert.png',
      thumbsUp: '/assets/ui/icons/icon_thumbs_up.png',
      foldedArms: '/assets/ui/icons/icon_folded_arms.png',
      frustration: '/assets/ui/icons/icon_frustrated.png'
    },
    dialogue: {
      box: '/assets/ui/dialogue/dialogue_box.png',
      bubble: '/assets/ui/dialogue/speech_bubble.png'
    }
  },
  audio: {
    music: {
      menu: '/assets/audio/music/menu_theme.mp3',
      gameplay: '/assets/audio/music/gameplay_theme.mp3',
      victory: '/assets/audio/music/victory_fanfare.mp3'
    },
    effects: {
      footstep: '/assets/audio/effects/footstep.wav',
      jump: '/assets/audio/effects/jump.wav',
      hit: '/assets/audio/effects/hit.wav',
      residentAlert: '/assets/audio/effects/alert.wav',
      votePositive: '/assets/audio/effects/positive_vote.wav',
      voteDoubtful: '/assets/audio/effects/doubtful_vote.wav',
      voteNegative: '/assets/audio/effects/negative_vote.wav',
      buttonClick: '/assets/audio/effects/click.wav'
    }
  }
};
