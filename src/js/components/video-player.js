let videoFormatAll = null

const initVideoPlayer = _ => {
	const controls = _io_q('.controls'),
		controlsPlay = controls.querySelector('.controls__play'),
		controlsSwitch = controls.querySelector('.controls__switch'),
		controlsSwitchIcon = controls.querySelector('.controls__switch svg use'),
		timeElapsed = controls.querySelector('.time__elapsed'),
		timeDuration = controls.querySelector('.time__duration'),
		progressSeek = controls.querySelector('.progress__seek'),
		progressSeekTooltip = controls.querySelector('.progress__seek-tooltip'),
		progressBar = controls.querySelector('.progress__bar'),
		progressBuffered = controls.querySelector('.progress__buffered'),
		volumeSeek = controls.querySelector('.volume__seek'),
		volumeBar = controls.querySelector('.volume__bar'),
		speed = controls.querySelector('.speed'),
		quality = controls.querySelector('.quality'),
		controlsScreenOpen = controls.querySelector('.controls__screen_open'),
		controlsScreenClose = controls.querySelector('.controls__screen_close'),
		controlsBar = controls.querySelector('.controls__bar'),
		controlsSponsorblock = controls.querySelector('.controls__sponsorblock'),
		videoWrapper = _io_q('.video').querySelector('.video__wrapper'),
		videoDesc = _io_q('.video').querySelector('.desc-video-info__text'),
		videoPoster = videoWrapper.querySelector('.video__poster'),
		video = videoWrapper.querySelector('video'),
		audio = videoWrapper.querySelector('audio'),
		dialogSb = _io_q('.dialog-sb'),
		dialogSbStart = dialogSb.querySelector('input#start'),
		dialogSbEnd = dialogSb.querySelector('input#end'),
		dialogSbWarning = dialogSb.querySelector('.dialog-sb__warning'),
		dialogSbBtnSend = dialogSb.querySelector('.dialog-sb__btn_send'),
		dialogSbBtnCancel = dialogSb.querySelector('.dialog-sb__btn_cancel');


	let doesSkipSegments = true;

	let iconPathPlay = 'img/svg/controls.svg#play',
		iconPathPause = 'img/svg/controls.svg#pause';

	let isSync = false

	let startTime = null
	let endTime = null
	let isRecording = false

	const onCloseModal = _ => {
		togglePlay()
		resetDialogSB()
	}

	const modal = new GraphModal({ isClose: onCloseModal })

	const chooseQuality = url => {
		let currentTime = null

		if (!video.paused) {
			currentTime = video.currentTime
			pauseVideo()
			pauseAudio()
			video.removeAttribute('src');
			video.load()
			video.src = url;
			video.currentTime = currentTime
			playVideo()
		} else {
			currentTime = video.currentTime
			video.removeAttribute('src');
			video.load()
			video.src = url;
			video.currentTime = currentTime
		}

		isSync = false
	}

	initDropdown(speed, params => {
		audio.playbackRate = params.btn.dataset.speed
		video.playbackRate = params.btn.dataset.speed

		isSync = false
	})

	initDropdown(quality, params => {
		for (let index = 0, length = videoFormatAll.length; index < length; index++) {
			const videoFormat = videoFormatAll[index];

			if (videoFormat.qualityLabel === params.btn.textContent)
				chooseQuality(videoFormat.url)
		}
	})

	const syncMedia = _ => {
		audio.currentTime = video.currentTime
		isSync = true
	}

	const isPlaying = el => el && el.currentTime > 0 && !el.paused && !el.ended && el.readyState > 2;

	const isPlayingVideo = _ => isPlaying(video)

	const isPlayingAudio = _ => isPlaying(audio)

	const pauseEl = el => { if (isPlaying(el)) el.pause() }

	const pauseVideo = _ => pauseEl(video)

	const pauseAudio = _ => pauseEl(audio)

	const playEl = el => {
		if (el) {
			let playPromise = el.play();

			if (playPromise !== undefined && !isPlaying(el)) {
				playPromise
					.then(_ => {
						if (audio) {
							if (isPlayingVideo() && isPlayingAudio())
								syncMedia()
						}
					})
					.catch(error => { showToast('error', error.message) });
			}
		}
	}

	const playAudio = _ => playEl(audio)

	const playVideo = _ => playEl(video)

	const togglePlay = _ => {
		if (audio) {
			if (!isPlayingVideo() && !isPlayingAudio()) {
				playVideo()
				playAudio()
			} else {
				pauseVideo()
				pauseAudio()
			}
		} else !isPlayingVideo() ? playVideo() : pauseVideo()

		toggleIconPlayPause()
		isSync = false
	}

	const initVideo = _ => {
		const videoDuration = Math.round(video.duration),
			time = normalizeDuration(videoDuration);

		progressSeek.setAttribute('max', videoDuration);
		progressBar.setAttribute('max', videoDuration);
		timeDuration.textContent = time;
		timeDuration.setAttribute('datetime', time)
		volumeBar.value = volumeSeek.value

		doesSkipSegments ||= true

		if (!videoPoster.classList.contains('_hidden'))
			videoPoster.classList.add('_hidden');
	}

	const changeIcon = iconPath => { controlsSwitchIcon.setAttribute('xlink:href', iconPath) }

	const showIconPlay = _ => { changeIcon(iconPathPlay) }

	const showIconPause = _ => { changeIcon(iconPathPause) }

	const toggleIconPlayPause = _ => { video.paused ? showIconPlay() : showIconPause() }

	const onEndVideo = _ => {
		if (audio)
			audio.currentTime = 0

		video.currentTime = 0
	}

	const updateTimeElapsed = _ => {
		const time = normalizeDuration(Math.round(video.currentTime));

		timeElapsed.textContent = time;
		timeElapsed.setAttribute('datetime', time)
	}

	const updateProgress = _ => {
		progressSeek.value = Math.floor(video.currentTime);
		progressBar.value = Math.floor(video.currentTime);
	}

	const updateSeekTooltip = event => {
		const skipTo = Math.round((event.offsetX / event.target.clientWidth) * +event.target.getAttribute('max'), 10);

		if (skipTo > 0 && skipTo < +event.target.getAttribute('max')) {
			const t = normalizeDuration(skipTo);
			progressSeek.setAttribute('data-seek', skipTo)
			progressSeekTooltip.textContent = t;
		}

		const rect = video.getBoundingClientRect();
		progressSeekTooltip.style.left = `${event.pageX - rect.left}px`;
	}

	const updateBuffered = _ => {
		let vbuffered = video.buffered

		if (audio) {
			let abuffered = audio.buffered
			let minBuffered = getMin(vbuffered.end(vbuffered.length - 1), abuffered.end(abuffered.length - 1))

			progressBuffered.style.setProperty('--buffered',
				`${convertToProc(minBuffered, video.duration)}%`)
		} else {
			progressBuffered.style.setProperty('--buffered',
				`${convertToProc(vbuffered.end(vbuffered.length - 1), video.duration)}%`)
		}
	}

	const skipAhead = event => {
		const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;

		video.currentTime = skipTo;
		progressBar.value = skipTo;
		progressSeek.value = skipTo;

		isSync = false
	}

	const updateVolumeEl = el => {
		el.muted &&= false;

		el.volume = volumeSeek.value;
		volumeBar.value = volumeSeek.value
	}

	const updateVolumeVideo = _ => updateVolumeEl(video)

	const updateVolumeAudio = _ => updateVolumeEl(audio)

	const toggleMuteEl = el => {
		el.muted = !el.muted;

		if (el.muted) {
			volumeSeek.setAttribute('data-volume', volumeSeek.value);
			volumeSeek.value = 0;
		} else
			volumeSeek.value = volumeSeek.dataset.volume;
	}

	const toggleMuteAudio = _ => toggleMuteEl(audio)

	const toggleMuteVideo = _ => toggleMuteEl(video)

	const openFullscreen = _ => {
		if (videoWrapper.requestFullscreen) {
			controlsScreenOpen.hidden = true;
			controlsScreenClose.hidden = false;
			videoWrapper.requestFullscreen();
		}
	}

	const closeFullscreen = _ => {
		if (document.exitFullscreen) {
			controlsScreenOpen.hidden = false;
			controlsScreenClose.hidden = true;
			document.exitFullscreen();
		}
	}

	const hideControls = _ => {
		let dropdownActive = controls.querySelector('.dropdown._active');

		if (dropdownActive)
			return

		controlsBar.classList.remove('_opened');
	}

	const showControls = _ => {
		controlsBar.classList.add('_opened');
	}

	const resetDialogSB = _ => {
		if (dialogSbStart.classList.contains('_error')) {
			dialogSbStart.classList.remove('_error')
			dialogSbEnd.classList.remove('_error')
			dialogSbWarning.hidden = true
		}
	}

	const invalidInputData = _ => {
		dialogSbStart.classList.add('_error')
		dialogSbEnd.classList.add('_error')
		dialogSbWarning.hidden = false
		dialogSbStart.focus()
	}

	const skipSegmentSB = _ => {
		if (!video.paused) {
			for (let index = 0, length = segmentsSB.length; index < length; index++) {
				const segmentSB = segmentsSB[index];
				if (video.currentTime >= segmentSB.startTime
					&& video.currentTime <= segmentSB.endTime) {
					video.currentTime = segmentSB.endTime;
					isSync = false

					if (storage.settings.notifySkipSegment)
						showToast('good', 'Segment is skipped!')
				}
			}
		}
	}

	const recordSegmentSB = _ => {
		if (isPlayingVideo()) {
			if (!isRecording) {
				startTime = timeElapsed.textContent
				isRecording = true
				controlsSponsorblock.classList.add('_record')
				showToast('good', 'Recording of segment is started...')
			} else {
				endTime = timeElapsed.textContent
				isRecording = false
				controlsSponsorblock.classList.remove('_record')

				if (document.fullscreenElement)
					closeFullscreen()

				togglePlay()
				resetDialogSB()
				dialogSbStart.value = startTime
				dialogSbEnd.value = endTime
				modal.open('dialog-sb')
			}
		} else showToast('error', 'You must play video!')
	}

	const isValidFields = _ => {
		let patternTimecodeMSS = new RegExp(/^[0-9]:[0-5][0-9]$/g)
		let patternTimecodeMMSS = new RegExp(/^[0-5][0-9]:[0-5][0-9]$/g)
		let patternTimecodeHMMSS = new RegExp(/^[0-9]:[0-5][0-9]:[0-5][0-9]$/g)
		let patternTimecodeHHMMSS = new RegExp(/^[0-2][0-3]:[0-5][0-9]:[0-5][0-9]$/g)

		return (dialogSbStart.value.match(patternTimecodeHHMMSS) && dialogSbEnd.value.match(patternTimecodeHHMMSS)
			|| dialogSbStart.value.match(patternTimecodeHMMSS) && dialogSbEnd.value.match(patternTimecodeHMMSS)
			|| dialogSbStart.value.match(patternTimecodeMMSS) && dialogSbEnd.value.match(patternTimecodeMMSS)
			|| dialogSbStart.value.match(patternTimecodeMSS) && dialogSbEnd.value.match(patternTimecodeMSS))
			&& convertDurationToSeconds(dialogSbStart.value) < convertDurationToSeconds(dialogSbEnd.value)
			&& convertDurationToSeconds(dialogSbEnd.value) <= convertDurationToSeconds(timeDuration.textContent)
	}

	const sendSegmentSB = async _ => {
		let videoId = _io_q('.video').dataset.id
		let dialogSbCategory = _io_q('.dialog-sb').querySelector('input[name="category"]:checked')

		if (isValidFields()) {
			try {
				await API.postSponsorblockInfo(`${videoId}`, uuidv4(), JSON.parse(`{
					"segment": [
						${convertDurationToSeconds(dialogSbStart.value)},
						${convertDurationToSeconds(dialogSbEnd.value)}
					],
					"category": "${dialogSbCategory.id}"
				}`))
				modal.close()
				showToast('good', 'Segment was sent successfully!')
			} catch (error) {
				showToast('error', error.message)
			} finally {
				startTime = null
				endTime = null
				dialogSbCategory = null
			}

		} else invalidInputData()
	}

	let timeout;

	video.addEventListener('loadedmetadata', initVideo);

	video.addEventListener('play', _ => {
		showIconPause()
		playAudio()
	})

	video.addEventListener('playing', _ => {
		showIconPause()
		playAudio()
	})

	video.addEventListener('waiting', _ => {
		if (!isPlayingVideo())
			pauseAudio()
	})

	if (audio) {
		audio.addEventListener('play', playVideo)

		audio.addEventListener('playing', playVideo)

		audio.addEventListener('waiting', _ => {
			if (!isPlayingAudio())
				pauseVideo()
		})
	}

	video.addEventListener('timeupdate', _ => {
		if (!isSync && isPlayingAudio() && isPlayingVideo())
			syncMedia()

		if (audio) {
			if (isPlayingAudio() && isPlayingVideo()) {
				updateBuffered()
				updateTimeElapsed()
				updateProgress()
			}
		} else {
			if (isPlayingVideo()) {
				updateBuffered()
				updateTimeElapsed()
				updateProgress()
			}
		}

		if (doesSkipSegments && !storage.settings.disableSponsorblock)
			skipSegmentSB()
	});

	video.addEventListener('stalled', _ => {
		showToast('good', 'Loading video...')
		pauseAudio()
	});

	video.addEventListener('abort', _ => {
		showToast('error', 'Video is aborted ;(')
		pauseAudio()
	});

	video.addEventListener('error', _ => {
		showToast('error', video.error.message)
		pauseAudio()
	});

	if (audio) {

		audio.addEventListener('error', _ => {
			showToast('error', audio.error.message)
			pauseVideo()
		});

		audio.addEventListener('stalled', _ => {
			showToast('good', 'Loading audio...')
			pauseVideo()
		});

		audio.addEventListener('abort', _ => {
			showToast('error', 'Audio is aborted ;(')
			pauseVideo()
		});
	}

	video.addEventListener('ended', onEndVideo)

	volumeSeek.addEventListener('input', _ => {
		audio ? updateVolumeAudio() : updateVolumeVideo()
	});

	progressSeek.addEventListener('mousemove', updateSeekTooltip);

	progressSeek.addEventListener('input', skipAhead);

	controlsSwitch.addEventListener('click', togglePlay);

	controlsScreenOpen.addEventListener('click', openFullscreen);

	controlsScreenClose.addEventListener('click', closeFullscreen);

	controlsPlay.addEventListener('click', togglePlay);

	controls.addEventListener('mouseleave', hideControls);

	controls.addEventListener('mousemove', _ => {
		clearTimeout(timeout);
		timeout = setTimeout(hideControls, 3000)
		showControls()
	});

	controlsSponsorblock.addEventListener('click', recordSegmentSB);

	videoDesc.addEventListener('click', e => {
		if (e.target.classList.contains('timecode')) {
			let timecode = e.target
			video.currentTime = convertDurationToSeconds(timecode.textContent)
			document.activeElement.blur()
			scrollToTop()
		}
	})

	dialogSbBtnSend.addEventListener('click', sendSegmentSB);

	dialogSbBtnCancel.addEventListener('click', _ => { modal.close() });

	dialogSbStart.addEventListener('input', _ => {
		resetDialogSB()
		dialogSbStart.value = formatDuration(dialogSbStart.value)
	});

	dialogSbEnd.addEventListener('input', _ => {
		resetDialogSB()
		dialogSbEnd.value = formatDuration(dialogSbEnd.value)
	});

	// HOT KEYS

	document.onkeyup = e => {
		if (_io_q('.video').classList.contains('_active')
			&& (document.activeElement === _io_q('body')
				|| document.activeElement === null)) {

			// ENTER || SPACE
			if (e.keyCode === 13 || e.keyCode === 32)
				togglePlay()

			// ARROW LEFT
			if (e.keyCode === 37) {
				video.currentTime -= 10
				isSync = false
			}

			// ARROW RIGHT
			if (e.keyCode === 39) {
				video.currentTime += 10
				isSync = false
			}

			// M
			if (e.keyCode === 77)
				audio ? toggleMuteAudio() : toggleMuteVideo()

			// S
			if (e.keyCode === 83 && !storage.settings.disableSponsorblock)
				recordSegmentSB()

			// V
			if (e.keyCode === 86 && !storage.settings.disableSponsorblock) {
				if (doesSkipSegments) {
					doesSkipSegments = false
					showToast('good', 'Sponsorblock is disabled on this video')
				} else {
					doesSkipSegments = true
					showToast('good', 'Sponsorblock is enabled again')
				}
			}

			// F
			if (e.keyCode === 70) {
				document.fullscreenElement ? closeFullscreen() : openFullscreen()
			}
		}
	}
}
