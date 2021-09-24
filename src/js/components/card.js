const fillVideoCard = (video, index, data) => {
	let videoImage = video.querySelector('.card__image img'),
		imageSkeleton = video.querySelector('.image-skeleton'),
		titleSkeleton = video.querySelector('.title-skeleton'),
		bottomSkeleton = video.querySelector('.bottom-skeleton'),
		videoTitle = video.querySelector('.card__title span'),
		videoViews = video.querySelector('.card__views'),
		videoDate = video.querySelector('.card__date'),
		videoChannel = video.querySelector('.card__channel'),
		videoDuration = video.querySelector('.card__duration');

	video.disabled = false;

	video.dataset.id = data[index].hasOwnProperty('videoId')
		? data[index].videoId
		: data[index].id
		
	data[index].bestThumbnail
		? videoImage.setAttribute('src', data[index].bestThumbnail.url)
		: videoImage.setAttribute('src', data[index].videoThumbnails.at(-1).url)

	videoImage.onload = _ => {
		imageSkeleton.classList.add('_removing');
		setTimeout(_ => {
			imageSkeleton.hidden = true
			imageSkeleton = null
		}, getDurationTimeout())

		videoImage = null
	}

	videoImage.onerror = _ => {
		showToast('error', 'Could not load images :(')
	}

	videoTitle.textContent = data[index].title;
	titleSkeleton.classList.add('_removing');

	setTimeout(_ => {
		titleSkeleton.hidden = true
		titleSkeleton = null
	}, getDurationTimeout());

	videoViews.textContent = data[index].hasOwnProperty('viewCount')
		? normalizeCount(data[index].viewCount)
		: normalizeCount(data[index].views)

	if (data[index].liveNow || data[index].premiere)
		video.classList.add('_live');

	videoDate.textContent = data[index].viewCountText
		? data[index].premiere || data[index].viewCountText.includes('wait')
			? 'Premiere'
			: data[index].liveNow
				? 'Live'
				: data[index].publishedText
		: data[index].hasOwnProperty('publishedText')
			? data[index].publishedText
			: data[index].hasOwnProperty('uploadedAt')
				? data[index].uploadedAt
				: '...'

	videoChannel.textContent = data[index].author.name
		? data[index].author.name
		: data[index].author

	videoChannel.dataset.id = data[index].authorId
		? data[index].authorId
		: data[index].author.channelID

	videoDuration.textContent = data[index].hasOwnProperty('lengthSeconds')
		? data[index].hasOwnProperty('simpleText')
			? data[index].lengthSeconds.simpleText
			: normalizeDuration(data[index].lengthSeconds)
		: normalizeDuration(data[index].duration)

	bottomSkeleton.classList.add('_removing');
	setTimeout(_ => {
		bottomSkeleton.hidden = true
		bottomSkeleton = null
	}, getDurationTimeout());


	videoTitle = null
	videoViews = null
	videoDate = null
	videoChannel = null
	videoDuration = null
}

const fillPlaylistCard = (playlist, index, data) => {
	let playlistImage = playlist.querySelector('.card__image img'),
		imageSkeleton = playlist.querySelector('.image-skeleton'),
		titleSkeleton = playlist.querySelector('.title-skeleton'),
		bottomSkeleton = playlist.querySelector('.bottom-skeleton'),
		playlistTitle = playlist.querySelector('.card__title span'),
		playlistChannel = playlist.querySelector('.card__channel'),
		playlistCount = playlist.querySelector('.card__count');

	playlist.disabled = false;
	playlist.dataset.id = data[index].hasOwnProperty('playlistID')
		? data[index].playlistID
		: data[index].playlistId

	data[index].firstVideo
		? playlistImage.setAttribute('src', data[index].firstVideo.bestThumbnail.url)
		: playlistImage.setAttribute('src', data[index].playlistThumbnail)

	playlistImage.onload = _ => {
		imageSkeleton.classList.add('_removing');

		setTimeout(_ => {
			imageSkeleton.hidden = true
			imageSkeleton = null
		}, getDurationTimeout())

		playlistImage = null;
	}

	playlistImage.onerror = _ => {
		showToast('error', 'Could not load images :(')
	}

	playlistTitle.textContent = data[index].title;
	titleSkeleton.classList.add('_removing');

	setTimeout(_ => {
		titleSkeleton.hidden = true
		titleSkeleton = null
	}, getDurationTimeout());

	playlistCount.textContent = data[index].hasOwnProperty('length')
		? data[index].length
		: data[index].videoCount

	playlistChannel.textContent = data[index].hasOwnProperty('owner')
		? data[index].owner.name
		: data[index].author

	playlistChannel.dataset.id = data[index].hasOwnProperty('owner')
		? data[index].owner.channelID
		: data[index].authorId

	bottomSkeleton.classList.add('_removing');
	setTimeout(_ => {
		bottomSkeleton.hidden = true
		bottomSkeleton = null
	}, getDurationTimeout());


	playlistTitle = null
	playlistChannel = null
	playlistCount = null
}

const fillChannelCard = (channel, index, data) => {
	let channelImage = channel.querySelector('.card__image img'),
		imageSkeleton = channel.querySelector('.image-skeleton'),
		titleSkeleton = channel.querySelector('.title-skeleton'),
		bottomSkeleton = channel.querySelector('.bottom-skeleton'),
		channelTitle = channel.querySelector('.card__title span'),
		channelDescr = channel.querySelector('.card__channel-descr'),
		channelSubs = channel.querySelector('.card__subs'),
		channelVideoCount = channel.querySelector('.card__video-count');

	channel.disabled = false;
	channel.dataset.id = data[index].channelID

	channelImage.setAttribute('src', data[index].bestAvatar.url)
	channelImage.onload = _ => {
		imageSkeleton.classList.add('_removing');
		setTimeout(_ => {
			imageSkeleton.hidden = true
			imageSkeleton = null
		}, getDurationTimeout())

		channelImage = null
	}

	channelImage.onerror = _ => {
		showToast('error', 'Could not load images :(')
	}

	channelTitle.textContent = data[index].name;

	titleSkeleton.classList.add('_removing');
	setTimeout(_ => {
		titleSkeleton.hidden = true
		titleSkeleton = null
	}, getDurationTimeout());

	channelDescr.textContent = data[index].descriptionShort;
	channelSubs.textContent = data[index].subscribers;
	channelVideoCount.textContent = `${data[index].videos} video`;

	bottomSkeleton.classList.add('_removing');
	setTimeout(_ => {
		bottomSkeleton.hidden = true
		bottomSkeleton = null
	}, getDurationTimeout());

	channelTitle = null
	channelDescr = null
	channelSubs = null
}

const fillAuthorCard = (author, index, data) => {
	let authorAvatar = author.querySelector('.author__avatar img');
	let avatarSkeleton = author.querySelector('.avatar-skeleton');
	let authorName = author.querySelector('.author__name');

	author.disabled = false

	if (data[index].avatar) {
		authorAvatar.src = data[index].avatar

		authorAvatar.onload = _ => {
			avatarSkeleton.classList.add('_removing')
			setTimeout(_ => {
				avatarSkeleton.hidden = true
				avatarSkeleton = null
			}, getDurationTimeout())
			authorAvatar = null
		}

		authorAvatar.onerror = _ => {
			showToast('error', 'Could not load avatar :(')
		}
	}
	authorName.textContent = data[index].name
	author.dataset.id = data[index].channelId
	authorName = null
}

const resetAuthorCard = async author => {
	let avatarSkeleton = author.querySelector('.avatar-skeleton');
	let authorName = author.querySelector('.author__name');

	author.disabled = true

	if (author.hidden)
		author.hidden = false

	avatarSkeleton.classList.remove('_removing')
	avatarSkeleton.hidden = false
	authorName.textContent = '...'

	avatarSkeleton = null
	authorName = null
}

const resetCard = async card => {
	let titleSkeleton = card.querySelector('.title-skeleton');
	let imageSkeleton = card.querySelector('.image-skeleton');
	let bottomSkeleton = card.querySelector('.bottom-skeleton');
	let cardTitle = card.querySelector('.card__title span');

	card.disabled = true

	if (imageSkeleton.classList.contains('_removing')) {
		imageSkeleton.classList.remove('_removing');
		imageSkeleton.hidden = false;
		titleSkeleton.classList.remove('_removing');
		titleSkeleton.hidden = false;
		bottomSkeleton.classList.remove('_removing');
		bottomSkeleton.hidden = false;
	}

	if (cardTitle.textContent !== 'Title')
		cardTitle.textContent = 'Title'

	if (card.hidden)
		card.hidden = false;

	if (card.classList.contains('_live'))
		card.classList.remove('_live');

	titleSkeleton = null
	imageSkeleton = null
	bottomSkeleton = null
	cardTitle = null
}

