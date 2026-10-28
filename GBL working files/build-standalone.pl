use strict;
use warnings;
use MIME::Base64 qw(encode_base64);
use File::Temp qw(tempdir);

sub read_file {
  my ($path, $binary) = @_;
  open my $fh, '<', $path or die "Cannot read $path: $!\n";
  binmode $fh if $binary;
  local $/;
  my $content = <$fh>;
  close $fh;
  return $content;
}

my $html = read_file('index.html', 0);
my $css  = read_file('styles/main.css', 0);
my $js   = read_file('scripts/app.js', 0);
my $impact = read_file('scripts/impact-data.js', 0);
my $impact_stories = read_file('scripts/impact-stories.js', 0);
my $xlsx = read_file('scripts/xlsx.mini.min.js', 0);

$js =~ s{url:'businesses\.html'}{anchor:'pMarketplace'};
$js =~ s{cta:'Open the business directory'}{cta:'Explore participant businesses'};
$js =~ s{pdf:'publications/[A-Za-z0-9_./-]+\.pdf'}{pdf:''}g;
$js =~ s{<a class="publication-cover" href="\$\{item\.pdf\}"[^>]*>(<img[^>]+>)</a>}{<div class="publication-cover publication-cover-static">$1</div>}g;
$js =~ s{<a class="publication-link" href="\$\{item\.pdf\}"[^>]*>Open PDF <span aria-hidden="true">↗</span></a>}{}g;
$css .= "\n.publication-cover-static:hover img{transform:none}\n";

$html =~ s{<link rel="stylesheet" href="styles/main\.css">}{<style>\n$css\n</style>};
$html =~ s{<script src="scripts/impact-data\.js" defer></script>}{<script>\n$impact\n</script>};
$html =~ s{<script src="scripts/impact-stories\.js" defer></script>}{<script>\n$impact_stories\n</script>};
$html =~ s{<script src="scripts/xlsx\.mini\.min\.js" defer></script>}{<script>\n$xlsx\n</script>};
$html =~ s{<script src="scripts/app\.js" defer></script>}{<script>\n$js\n</script>};

my %assets;
while ($html =~ m{((?:images|data|publications)/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|svg|webp|xlsx))}g) {
  $assets{$1} = 1;
}

my $temp_dir = tempdir(CLEANUP => 1);

sub email_asset_path {
  my ($path) = @_;
  return $path unless $path =~ /\.(?:jpe?g|png)$/i;

  my $safe_name = $path;
  $safe_name =~ s{[^A-Za-z0-9_.-]}{_}g;
  my $candidate = "$temp_dir/$safe_name";
  my @command;

  if ($path =~ /\.png$/i) {
    @command = ('sips', '-Z', '600', '-s', 'format', 'png', $path, '--out', $candidate);
  } else {
    my $is_text_heavy = $path =~ m{(?:publications|partner-logos)};
    my $max_dimension = $is_text_heavy ? 720 : 660;
    my $quality = $is_text_heavy ? 60 : 42;
    @command = ('sips', '-Z', $max_dimension, '-s', 'format', 'jpeg', '-s', 'formatOptions', $quality, $path, '--out', $candidate);
  }

  open my $saved_stdout, '>&', \*STDOUT or return $path;
  open STDOUT, '>', '/dev/null' or return $path;
  my $status = system @command;
  open STDOUT, '>&', $saved_stdout or return $path;
  close $saved_stdout;

  return $path if $status != 0 || !-s $candidate;
  return -s $candidate < -s $path ? $candidate : $path;
}

for my $path (sort { length($b) <=> length($a) } keys %assets) {
  my ($ext) = $path =~ /\.([^.]+)$/;
  my %mime = (
    jpg => 'image/jpeg', jpeg => 'image/jpeg', png => 'image/png',
    svg => 'image/svg+xml', webp => 'image/webp',
    xlsx => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  my $email_path = email_asset_path($path);
  my $uri = 'data:' . $mime{lc $ext} . ';base64,' . encode_base64(read_file($email_path, 1), '');
  $html =~ s{(?:\.\./)?\Q$path\E}{$uri}g;
}

$html =~ s{<head>}{<head>\n<!-- Standalone email-share copy: local assets, styles and scripts are embedded. -->};

open my $out, '>', 'GBL-network-email.html' or die "Cannot write output: $!\n";
binmode $out;
print {$out} $html;
close $out;

my $output_bytes = -s 'GBL-network-email.html';
die "GBL-network-email.html is still above the 5 MB email limit ($output_bytes bytes).\n"
  if $output_bytes >= 5_000_000;
printf "Updated GBL-network-email.html with %d embedded assets (%.2f MB).\n", scalar(keys %assets), $output_bytes / 1_000_000;
